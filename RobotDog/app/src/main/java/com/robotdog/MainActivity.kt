package com.robotdog

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.MotionEvent
import android.view.WindowManager
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var faceView: FaceAnimationView
    private lateinit var statusText: TextView
    private lateinit var micButton: ImageButton
    private lateinit var connectButton: Button
    private lateinit var chatText: TextView
    private lateinit var joystickLayout: FrameLayout

    private lateinit var voiceManager: VoiceManager
    private lateinit var esp32Manager: Esp32Manager
    private var gptManager: GptManager? = null

    private var isListening = false
    private var apiKey = ""
    private var esp32Ip = "192.168.4.1"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_main)

        bindViews()
        requestPermissions()
        setupEsp32()
        setupVoiceManager()
        showSettingsIfNeeded()
    }

    private fun bindViews() {
        faceView = findViewById(R.id.faceView)
        statusText = findViewById(R.id.statusText)
        micButton = findViewById(R.id.micButton)
        connectButton = findViewById(R.id.connectButton)
        chatText = findViewById(R.id.chatText)
        joystickLayout = findViewById(R.id.joystickLayout)

        micButton.setOnClickListener { toggleListening() }
        connectButton.setOnClickListener { showConnectionDialog() }

        setupJoystick()
    }

    private fun setupJoystick() {
        var startX = 0f; var startY = 0f
        joystickLayout.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startX = event.x; startY = event.y
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.x - startX
                    val dy = event.y - startY
                    val threshold = 40f
                    when {
                        dy < -threshold -> esp32Manager.move(Esp32Manager.Direction.FORWARD)
                        dy > threshold  -> esp32Manager.move(Esp32Manager.Direction.BACKWARD)
                        dx < -threshold -> esp32Manager.move(Esp32Manager.Direction.LEFT)
                        dx > threshold  -> esp32Manager.move(Esp32Manager.Direction.RIGHT)
                    }
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    esp32Manager.stop()
                    true
                }
                else -> false
            }
        }
    }

    private fun setupEsp32() {
        esp32Manager = Esp32Manager(
            onConnected = {
                runOnUiThread {
                    connectButton.text = "Bağlı ✓"
                    connectButton.setBackgroundColor(0xFF4CAF50.toInt())
                    setStatus("ESP32 bağlandı")
                    esp32Manager.setLed(0, 100, 255)
                }
            },
            onDisconnected = {
                runOnUiThread {
                    connectButton.text = "Bağlan"
                    connectButton.setBackgroundColor(0xFFFF6B35.toInt())
                    setStatus("ESP32 bağlantısı kesildi")
                }
            }
        )
    }

    private fun setupVoiceManager() {
        voiceManager = VoiceManager(
            context = this,
            onListeningStart = {
                runOnUiThread {
                    isListening = true
                    faceView.startListening()
                    micButton.setImageResource(android.R.drawable.ic_btn_speak_now)
                    setStatus("Seni dinliyorum...")
                }
            },
            onResult = { text ->
                runOnUiThread {
                    isListening = false
                    micButton.setImageResource(android.R.drawable.ic_lock_silent_mode_off)
                    chatText.text = "Sen: $text"
                    processUserInput(text)
                }
            },
            onSpeakingStart = {
                runOnUiThread {
                    faceView.startSpeaking()
                    esp32Manager.expressEmotion("speak")
                }
            },
            onSpeakingEnd = {
                runOnUiThread {
                    faceView.stopSpeaking()
                    esp32Manager.stop()
                    setStatus("Hazır")
                }
            },
            onError = { msg ->
                runOnUiThread {
                    isListening = false
                    micButton.setImageResource(android.R.drawable.ic_lock_silent_mode_off)
                    setStatus("Hata: $msg")
                }
            }
        )
    }

    private fun processUserInput(text: String) {
        val gpt = gptManager
        if (gpt == null) {
            voiceManager.speak("API anahtarı girilmemiş. Lütfen ayarlardan ekle.")
            return
        }

        setStatus("Düşünüyorum...")
        faceView.setEmotion(FaceAnimationView.Emotion.THINKING)

        lifecycleScope.launch {
            try {
                val response = gpt.chat(text)

                runOnUiThread {
                    // Duygu
                    val emotion = when (response.emotion) {
                        "happy"     -> FaceAnimationView.Emotion.HAPPY
                        "thinking"  -> FaceAnimationView.Emotion.THINKING
                        "surprised" -> FaceAnimationView.Emotion.SURPRISED
                        "angry"     -> FaceAnimationView.Emotion.ANGRY
                        "sleeping"  -> FaceAnimationView.Emotion.SLEEPING
                        else        -> FaceAnimationView.Emotion.IDLE
                    }
                    faceView.setEmotion(emotion)

                    // Baş hareketi
                    response.headPos?.let { pos ->
                        val headPos = when (pos) {
                            "left"   -> Esp32Manager.HeadPos.LEFT
                            "right"  -> Esp32Manager.HeadPos.RIGHT
                            "up"     -> Esp32Manager.HeadPos.UP
                            "down"   -> Esp32Manager.HeadPos.DOWN
                            else     -> Esp32Manager.HeadPos.CENTER
                        }
                        esp32Manager.setHead(headPos)

                        val lookX = when (pos) { "left" -> -0.7f; "right" -> 0.7f; else -> 0f }
                        val lookY = when (pos) { "up" -> -0.5f; "down" -> 0.5f; else -> 0f }
                        faceView.lookAt(lookX, lookY)
                    }

                    // Hareket komutu
                    response.action?.let { action ->
                        val dir = when (action) {
                            "move_forward"  -> Esp32Manager.Direction.FORWARD
                            "move_backward" -> Esp32Manager.Direction.BACKWARD
                            "turn_left"     -> Esp32Manager.Direction.LEFT
                            "turn_right"    -> Esp32Manager.Direction.RIGHT
                            else            -> null
                        }
                        dir?.let { esp32Manager.move(it) }
                        if (action == "dance") {
                            esp32Manager.expressEmotion("dance")
                            faceView.setEmotion(FaceAnimationView.Emotion.HAPPY)
                        }
                    }

                    // Konuş
                    chatText.text = "Loona: ${response.text}"
                    voiceManager.speak(response.text)
                }
            } catch (e: Exception) {
                runOnUiThread {
                    setStatus("Hata: ${e.message}")
                    faceView.setEmotion(FaceAnimationView.Emotion.IDLE)
                }
            }
        }
    }

    private fun toggleListening() {
        if (isListening) {
            voiceManager.stopListening()
            isListening = false
        } else {
            voiceManager.startListening()
        }
    }

    private fun showConnectionDialog() {
        val input = EditText(this).apply {
            setText(esp32Ip)
            hint = "ESP32 IP adresi"
        }
        AlertDialog.Builder(this)
            .setTitle("ESP32 Bağlan")
            .setMessage("ESP32'nin IP adresini girin (WiFi AP modunda 192.168.4.1)")
            .setView(input)
            .setPositiveButton("Bağlan") { _, _ ->
                esp32Ip = input.text.toString()
                esp32Manager.connect(esp32Ip)
            }
            .setNegativeButton("İptal", null)
            .show()
    }

    private fun showSettingsIfNeeded() {
        val prefs = getSharedPreferences("robotdog", MODE_PRIVATE)
        apiKey = prefs.getString("api_key", "") ?: ""

        if (apiKey.isEmpty()) {
            val input = EditText(this).apply { hint = "sk-..." }
            AlertDialog.Builder(this)
                .setTitle("OpenAI API Anahtarı")
                .setMessage("GPT özelliği için API anahtarını girin:")
                .setView(input)
                .setPositiveButton("Kaydet") { _, _ ->
                    apiKey = input.text.toString().trim()
                    prefs.edit().putString("api_key", apiKey).apply()
                    gptManager = GptManager(apiKey)
                    setStatus("Hazır! Mikrofon butonuna bas.")
                }
                .setNegativeButton("Atla") { _, _ ->
                    setStatus("GPT kapalı — sadece manuel kontrol")
                }
                .show()
        } else {
            gptManager = GptManager(apiKey)
            setStatus("Hazır! Mikrofon butonuna bas.")
        }
    }

    private fun setStatus(msg: String) {
        statusText.text = msg
    }

    private fun requestPermissions() {
        val perms = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA,
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_WIFI_STATE
        )
        val missing = perms.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), 1)
    }

    override fun onDestroy() {
        super.onDestroy()
        voiceManager.destroy()
        esp32Manager.disconnect()
    }
}
