package com.anonymous.matheus123

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.ScanResult
import android.net.wifi.WifiNetworkSpecifier
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

  private var activeNetworkCallback: ConnectivityManager.NetworkCallback? = null

  override fun getName(): String = "WifiScanner"

  @ReactMethod
  fun scanWifiNetworks(forceRefresh: Boolean, promise: Promise) {
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

  @ReactMethod
  fun connectToNetwork(ssid: String, securityType: String, password: String, promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      promise.reject(
          "WIFI_CONNECT_UNSUPPORTED",
          "Conexao pelo app exige Android 10 ou superior neste projeto.",
      )
      return
    }

    if (ssid.isBlank()) {
      promise.reject("WIFI_CONNECT_INVALID", "Nome da rede invalido.")
      return
    }

    if (securityType == "WEP") {
      promise.reject(
          "WIFI_CONNECT_WEP_UNSUPPORTED",
          "Redes WEP nao sao suportadas para conexao pelo app no Android moderno.",
      )
      return
    }

    try {
      val connectivityManager =
          reactContext.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE)
              as ConnectivityManager
      val specifierBuilder = WifiNetworkSpecifier.Builder().setSsid(ssid)

      when (securityType) {
        "OPEN" -> {
          // Open network, no passphrase required.
        }
        "WPA3" -> {
          if (password.length < 8) {
            promise.reject("WIFI_CONNECT_PASSWORD", "A senha precisa ter pelo menos 8 caracteres.")
            return
          }
          specifierBuilder.setWpa3Passphrase(password)
        }
        else -> {
          if (password.length < 8) {
            promise.reject("WIFI_CONNECT_PASSWORD", "A senha precisa ter pelo menos 8 caracteres.")
            return
          }
          specifierBuilder.setWpa2Passphrase(password)
        }
      }

      activeNetworkCallback?.let { connectivityManager.unregisterNetworkCallback(it) }

      val request =
          NetworkRequest.Builder()
              .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
              .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
              .setNetworkSpecifier(specifierBuilder.build())
              .build()

      val callback =
          object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
              connectivityManager.bindProcessToNetwork(network)
              if (activeNetworkCallback == this) {
                promise.resolve("CONNECTED")
              }
            }

            override fun onUnavailable() {
              if (activeNetworkCallback == this) {
                activeNetworkCallback = null
                promise.reject(
                    "WIFI_CONNECT_UNAVAILABLE",
                    "O Android nao conseguiu conectar ou o usuario cancelou.",
                )
              }
            }

            override fun onLost(network: Network) {
              if (activeNetworkCallback == this) {
                connectivityManager.bindProcessToNetwork(null)
                activeNetworkCallback = null
              }
            }
          }

      activeNetworkCallback = callback
      connectivityManager.requestNetwork(request, callback)
    } catch (error: SecurityException) {
      promise.reject("WIFI_CONNECT_PERMISSION", "Permissoes de Wi-Fi/localizacao ausentes.", error)
    } catch (error: Exception) {
      promise.reject("WIFI_CONNECT_ERROR", "Nao foi possivel pedir conexao Wi-Fi.", error)
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
