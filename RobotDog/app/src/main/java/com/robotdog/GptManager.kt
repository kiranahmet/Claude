package com.robotdog

import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class GptManager(private val apiKey: String) {

    data class RobotResponse(
        val text: String,         // Söylenecek metin
        val emotion: String,      // "happy","thinking","idle","surprised","angry","sleeping"
        val action: String?,      // "move_forward","turn_left","turn_right","stop","dance" veya null
        val headPos: String?      // "left","right","up","down","center" veya null
    )

    private val client = OkHttpClient()
    private val history = mutableListOf<JSONObject>()

    private val systemPrompt = """
        Sen Loona adında sevimli bir robot köpeksin. Türkçe konuşuyorsun.
        Kısa, eğlenceli ve samimi cevaplar ver (max 2 cümle).

        Her cevabında JSON döndür:
        {
          "text": "söylenecek metin",
          "emotion": "happy|thinking|idle|surprised|angry|sleeping",
          "action": "move_forward|turn_left|turn_right|stop|dance|null",
          "head": "left|right|up|down|center|null"
        }

        Kullanıcı "ileri git" derse action=move_forward, "dur" derse action=stop, vb.
        Eğlenceli ol, bazen havla (Hav hav!), kuyruk sallar gibi davran.
    """.trimIndent()

    suspend fun chat(userMessage: String): RobotResponse = withContext(Dispatchers.IO) {
        history.add(JSONObject().put("role", "user").put("content", userMessage))

        val messages = JSONArray().apply {
            put(JSONObject().put("role", "system").put("content", systemPrompt))
            history.forEach { put(it) }
        }

        val body = JSONObject()
            .put("model", "gpt-4o-mini")
            .put("messages", messages)
            .put("response_format", JSONObject().put("type", "json_object"))
            .put("max_tokens", 200)
            .toString()

        val request = Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("Content-Type", "application/json")
            .post(body.toRequestBody("application/json".toMediaType()))
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: throw IOException("Boş yanıt")

        val json = JSONObject(responseBody)
        val content = json.getJSONArray("choices")
            .getJSONObject(0)
            .getJSONObject("message")
            .getString("content")

        val parsed = JSONObject(content)
        val text = parsed.optString("text", "Anlamadım, tekrar söyler misin?")

        history.add(JSONObject().put("role", "assistant").put("content", content))
        if (history.size > 20) history.removeAt(0)

        RobotResponse(
            text = text,
            emotion = parsed.optString("emotion", "idle"),
            action = parsed.optString("action").takeIf { it != "null" && it.isNotEmpty() },
            headPos = parsed.optString("head").takeIf { it != "null" && it.isNotEmpty() }
        )
    }

    fun clearHistory() = history.clear()
}
