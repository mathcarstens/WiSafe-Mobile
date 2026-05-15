package com.anonymous.matheus123

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray

class WifiScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WifiScanner"

  @ReactMethod
  fun scanWifiNetworks(promise: Promise) {
    val appContext = reactContext.applicationContext
    val wifiManager = appContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

    if (!wifiManager.isWifiEnabled) {
      promise.reject("WIFI_DISABLED", "O Wi-Fi do aparelho esta desligado.")
      return
    }

    val handler = Handler(Looper.getMainLooper())
    var finished = false

    lateinit var receiver: BroadcastReceiver
    receiver =
        object : BroadcastReceiver() {
          override fun onReceive(context: Context?, intent: Intent?) {
            if (finished) return

            finished = true
            safelyUnregisterReceiver(this)
            promise.resolve(mapResults(wifiManager.scanResults))
          }
        }

    try {
      val filter = IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        appContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        appContext.registerReceiver(receiver, filter)
      }

      val started = wifiManager.startScan()

      if (!started) {
        finished = true
        safelyUnregisterReceiver(receiver)
        promise.resolve(mapResults(wifiManager.scanResults))
        return
      }

      handler.postDelayed(
          {
            if (!finished) {
              finished = true
              safelyUnregisterReceiver(receiver)
              promise.resolve(mapResults(wifiManager.scanResults))
            }
          },
          8000,
      )
    } catch (error: SecurityException) {
      finished = true
      safelyUnregisterReceiver(receiver)
      promise.reject("WIFI_PERMISSION_ERROR", "Permissoes de Wi-Fi/localizacao ausentes.", error)
    } catch (error: Exception) {
      finished = true
      safelyUnregisterReceiver(receiver)
      promise.reject("WIFI_SCAN_ERROR", "Nao foi possivel escanear redes Wi-Fi.", error)
    }
  }

  private fun safelyUnregisterReceiver(receiver: BroadcastReceiver) {
    try {
      reactContext.applicationContext.unregisterReceiver(receiver)
    } catch (_: IllegalArgumentException) {
      // Receiver already unregistered.
    }
  }

  private fun mapResults(results: List<ScanResult>): WritableArray {
    val array = Arguments.createArray()

    results.forEach { result ->
      val item = Arguments.createMap()
      item.putString("SSID", result.SSID ?: "")
      item.putString("BSSID", result.BSSID ?: "")
      item.putInt("level", result.level)
      item.putInt("frequency", result.frequency)
      item.putString("capabilities", result.capabilities ?: "")
      array.pushMap(item)
    }

    return array
  }
}
