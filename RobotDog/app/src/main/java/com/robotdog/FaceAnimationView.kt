package com.robotdog

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import kotlin.math.min
import kotlin.random.Random

class FaceAnimationView @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null
) : View(context, attrs) {

    enum class Emotion { IDLE, HAPPY, THINKING, SLEEPING, SURPRISED, ANGRY }

    private var emotion = Emotion.IDLE
    private var blinkProgress = 1f   // 1=open, 0=closed
    private var lookX = 0f           // -1..1
    private var lookY = 0f           // -1..1
    private var mouthOpen = 0f       // 0..1 (konuşurken)
    private var isListening = false
    private var isSpeaking = false

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#1A1A2E")
    }
    private val eyeWhitePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
    }
    private val eyePupilPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#1A1A2E")
    }
    private val eyeGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#00D4FF")
        maskFilter = BlurMaskFilter(30f, BlurMaskFilter.Blur.OUTER)
    }
    private val mouthPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#00D4FF")
        style = Paint.Style.STROKE
        strokeWidth = 8f
        strokeCap = Paint.Cap.ROUND
    }
    private val listeningPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FF6B35")
        alpha = 180
    }

    // Animatörler
    private val blinkAnimator = ValueAnimator.ofFloat(1f, 0f, 1f).apply {
        duration = 150
        addUpdateListener { blinkProgress = it.animatedValue as Float; invalidate() }
    }

    private val mouthAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = 200
        repeatMode = ValueAnimator.REVERSE
        repeatCount = ValueAnimator.INFINITE
        addUpdateListener { mouthOpen = it.animatedValue as Float; invalidate() }
    }

    private val lookAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = 800
        interpolator = AccelerateDecelerateInterpolator()
        addUpdateListener { invalidate() }
    }

    init {
        setLayerType(LAYER_TYPE_SOFTWARE, null)
        scheduleRandomBlink()
        scheduleRandomLook()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        val cx = w / 2f
        val cy = h / 2f
        val unit = min(w, h) / 10f

        // Arka plan
        canvas.drawRect(0f, 0f, w, h, bgPaint)

        // Dinleme halkası
        if (isListening) {
            val ringPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Color.parseColor("#FF6B35")
                style = Paint.Style.STROKE
                strokeWidth = unit * 0.3f
                alpha = 120
            }
            canvas.drawCircle(cx, cy, unit * 4f, ringPaint)
        }

        drawEyes(canvas, cx, cy, unit)
        drawMouth(canvas, cx, cy, unit)
    }

    private fun drawEyes(canvas: Canvas, cx: Float, cy: Float, unit: Float) {
        val eyeOffsetX = unit * 2.2f
        val eyeOffsetY = unit * 0.5f
        val leftCx = cx - eyeOffsetX
        val rightCx = cx + eyeOffsetX
        val eyeCy = cy - eyeOffsetY

        val eyeW = unit * 1.6f
        val eyeH = unit * 1.6f * blinkProgress

        when (emotion) {
            Emotion.HAPPY -> drawHappyEye(canvas, leftCx, eyeCy, eyeW, unit)
                .also { drawHappyEye(canvas, rightCx, eyeCy, eyeW, unit) }

            Emotion.SLEEPING -> drawSleepingEye(canvas, leftCx, eyeCy, eyeW, unit)
                .also { drawSleepingEye(canvas, rightCx, eyeCy, eyeW, unit) }

            Emotion.SURPRISED -> drawSurprisedEye(canvas, leftCx, eyeCy, unit * 2f, unit)
                .also { drawSurprisedEye(canvas, rightCx, eyeCy, unit * 2f, unit) }

            else -> {
                // Normal yuvarlak göz
                val pupilOffX = lookX * eyeW * 0.3f
                val pupilOffY = lookY * eyeH * 0.3f

                for (ecx in listOf(leftCx, rightCx)) {
                    // Glow
                    canvas.drawOval(
                        RectF(ecx - eyeW - 10, eyeCy - eyeH - 10, ecx + eyeW + 10, eyeCy + eyeH + 10),
                        eyeGlowPaint
                    )
                    // Beyaz
                    canvas.drawOval(
                        RectF(ecx - eyeW, eyeCy - eyeH, ecx + eyeW, eyeCy + eyeH),
                        eyeWhitePaint
                    )
                    // Pupil
                    val pr = eyeW * 0.55f
                    canvas.drawCircle(ecx + pupilOffX, eyeCy + pupilOffY, pr, eyePupilPaint)
                    // Parlama
                    val glintPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE; alpha = 200 }
                    canvas.drawCircle(ecx + pupilOffX + pr * 0.3f, eyeCy + pupilOffY - pr * 0.3f, pr * 0.2f, glintPaint)
                }
            }
        }
    }

    private fun drawHappyEye(canvas: Canvas, ecx: Float, ecy: Float, eyeW: Float, unit: Float) {
        val path = Path()
        path.moveTo(ecx - eyeW, ecy)
        path.quadTo(ecx, ecy - unit * 1.4f, ecx + eyeW, ecy)
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#00D4FF")
            style = Paint.Style.STROKE
            strokeWidth = unit * 0.4f
            strokeCap = Paint.Cap.ROUND
        }
        canvas.drawPath(path, p)
    }

    private fun drawSleepingEye(canvas: Canvas, ecx: Float, ecy: Float, eyeW: Float, unit: Float) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = unit * 0.3f
            strokeCap = Paint.Cap.ROUND
        }
        canvas.drawLine(ecx - eyeW * 0.8f, ecy, ecx + eyeW * 0.8f, ecy, p)
    }

    private fun drawSurprisedEye(canvas: Canvas, ecx: Float, ecy: Float, r: Float, unit: Float) {
        canvas.drawCircle(ecx, ecy, r, eyeGlowPaint)
        canvas.drawCircle(ecx, ecy, r, eyeWhitePaint)
        canvas.drawCircle(ecx, ecy, r * 0.45f, eyePupilPaint)
    }

    private fun drawMouth(canvas: Canvas, cx: Float, cy: Float, unit: Float) {
        val my = cy + unit * 2.2f
        val mw = unit * 1.8f

        when (emotion) {
            Emotion.HAPPY -> {
                val path = Path()
                path.moveTo(cx - mw, my - unit * 0.3f)
                path.quadTo(cx, my + unit * 0.8f, cx + mw, my - unit * 0.3f)
                canvas.drawPath(path, mouthPaint)
            }
            Emotion.ANGRY -> {
                val path = Path()
                path.moveTo(cx - mw, my + unit * 0.3f)
                path.quadTo(cx, my - unit * 0.6f, cx + mw, my + unit * 0.3f)
                canvas.drawPath(path, mouthPaint.apply { color = Color.parseColor("#FF4444") })
            }
            Emotion.THINKING -> {
                val path = Path()
                path.moveTo(cx - mw * 0.5f, my)
                path.quadTo(cx + mw * 0.3f, my - unit * 0.4f, cx + mw * 0.8f, my)
                canvas.drawPath(path, mouthPaint)
            }
            else -> {
                if (isSpeaking && mouthOpen > 0.1f) {
                    // Konuşma ağzı - oval açılıp kapanır
                    val mh = unit * 0.8f * mouthOpen
                    canvas.drawOval(RectF(cx - mw * 0.6f, my - mh, cx + mw * 0.6f, my + mh), mouthPaint.apply {
                        style = Paint.Style.FILL_AND_STROKE
                        color = Color.parseColor("#003355")
                    })
                    canvas.drawOval(RectF(cx - mw * 0.6f, my - mh, cx + mw * 0.6f, my + mh), mouthPaint.apply {
                        style = Paint.Style.STROKE
                        color = Color.parseColor("#00D4FF")
                    })
                } else {
                    canvas.drawLine(cx - mw * 0.5f, my, cx + mw * 0.5f, my, mouthPaint)
                }
            }
        }
    }

    // Dışarıdan çağrılan fonksiyonlar
    fun setEmotion(e: Emotion) {
        emotion = e
        invalidate()
    }

    fun startListening() {
        isListening = true
        isSpeaking = false
        mouthAnimator.cancel()
        setEmotion(Emotion.THINKING)
    }

    fun startSpeaking() {
        isListening = false
        isSpeaking = true
        setEmotion(Emotion.IDLE)
        mouthAnimator.start()
    }

    fun stopSpeaking() {
        isSpeaking = false
        mouthAnimator.cancel()
        mouthOpen = 0f
        setEmotion(Emotion.IDLE)
        invalidate()
    }

    fun blink() {
        if (!blinkAnimator.isRunning) blinkAnimator.start()
    }

    fun lookAt(x: Float, y: Float) {
        lookX = x.coerceIn(-1f, 1f)
        lookY = y.coerceIn(-1f, 1f)
        invalidate()
    }

    private fun scheduleRandomBlink() {
        postDelayed({
            blink()
            scheduleRandomBlink()
        }, Random.nextLong(2000, 5000))
    }

    private fun scheduleRandomLook() {
        postDelayed({
            if (!isListening && !isSpeaking) {
                lookAt(Random.nextFloat() * 2 - 1, Random.nextFloat() * 0.6f - 0.3f)
            }
            scheduleRandomLook()
        }, Random.nextLong(3000, 7000))
    }
}
