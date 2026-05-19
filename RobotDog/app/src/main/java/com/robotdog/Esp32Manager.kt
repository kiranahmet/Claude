package com.robotdog

import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.Socket
import java.io.PrintWriter

class Esp32Manager(
    private val onConnected: () -> Unit,
    private val onDisconnected: () -> Unit
) {
    enum class Direction { FORWARD, BACKWARD, LEFT, RIGHT, STOP }
    enum class HeadPos { CENTER, LEFT, RIGHT, UP, DOWN }

    private var esp32Ip = "192.168.4.1"  // ESP32 AP modu varsayılan IP
    private val port = 4210
    private var udpSocket: DatagramSocket? = null
    private var isConnected = false
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    fun connect(ip: String = esp32Ip) {
        esp32Ip = ip
        scope.launch {
            try {
                udpSocket = DatagramSocket()
                udpSocket?.soTimeout = 3000
                isConnected = true
                withContext(Dispatchers.Main) { onConnected() }
                startHeartbeat()
            } catch (e: Exception) {
                isConnected = false
                withContext(Dispatchers.Main) { onDisconnected() }
            }
        }
    }

    fun disconnect() {
        isConnected = false
        udpSocket?.close()
        udpSocket = null
        scope.launch(Dispatchers.Main) { onDisconnected() }
    }

    // Hareket komutları
    fun move(direction: Direction, speed: Int = 200) {
        val cmd = when (direction) {
            Direction.FORWARD  -> JSONObject().put("cmd", "move").put("dir", "F").put("spd", speed)
            Direction.BACKWARD -> JSONObject().put("cmd", "move").put("dir", "B").put("spd", speed)
            Direction.LEFT     -> JSONObject().put("cmd", "move").put("dir", "L").put("spd", speed)
            Direction.RIGHT    -> JSONObject().put("cmd", "move").put("dir", "R").put("spd", speed)
            Direction.STOP     -> JSONObject().put("cmd", "stop")
        }
        send(cmd)
    }

    fun stop() = move(Direction.STOP)

    // Baş hareketi (servo)
    fun setHead(pos: HeadPos) {
        val (pan, tilt) = when (pos) {
            HeadPos.CENTER -> Pair(90, 90)
            HeadPos.LEFT   -> Pair(130, 90)
            HeadPos.RIGHT  -> Pair(50, 90)
            HeadPos.UP     -> Pair(90, 60)
            HeadPos.DOWN   -> Pair(90, 120)
        }
        send(JSONObject().put("cmd", "head").put("pan", pan).put("tilt", tilt))
    }

    // Özel ses çal (ESP32'deki buzzer)
    fun playSound(note: String) {
        send(JSONObject().put("cmd", "sound").put("note", note))
    }

    // LED rengi ayarla
    fun setLed(r: Int, g: Int, b: Int) {
        send(JSONObject().put("cmd", "led").put("r", r).put("g", g).put("b", b))
    }

    // Sensör verisi iste
    fun requestSensorData() {
        send(JSONObject().put("cmd", "sensor"))
    }

    // Duygu bazlı LED+ses efekti
    fun expressEmotion(emotion: String) {
        val cmd = JSONObject().put("cmd", "emotion").put("type", emotion)
        send(cmd)
    }

    private fun send(json: JSONObject) {
        if (!isConnected) return
        scope.launch {
            try {
                val data = json.toString().toByteArray()
                val addr = InetAddress.getByName(esp32Ip)
                val packet = DatagramPacket(data, data.size, addr, port)
                udpSocket?.send(packet)
            } catch (_: Exception) {}
        }
    }

    private fun startHeartbeat() {
        scope.launch {
            while (isConnected) {
                delay(5000)
                send(JSONObject().put("cmd", "ping"))
            }
        }
    }

    fun isConnected() = isConnected
}
