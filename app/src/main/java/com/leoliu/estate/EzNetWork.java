package com.leoliu.estate;

import android.app.Activity;
import android.util.Log;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.UUID;


import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.RunnableFuture;

//
// 參考  http://www.eoeandroid.com/thread-543421-1-1.html
enum NET_CMD {
    NET_CMD_LOGIN,
    NET_CMD_LOGOUT,
    NET_CMD_REGISITER
}
/**
 * Created by actio on 2017/7/6.
 */
public class EzNetWork {

    static String TAG = "EzNetWork";
    private static Activity mActivity;
    public static String Url = "";          // IP

    //***********************************************************************************************************
    // 創建
    //***********************************************************************************************************
    public static void onCreate(Activity activity, String project_name) {
        Log.d(TAG, "onCreate");

        mActivity = activity;
    }

    public static String SenCmd( NET_CMD Cmd, String urlParameters )
    {
        String Ret = "";
        switch ( Cmd )
        {
            case NET_CMD_LOGIN:
                Ret = excutePost( Url + "MblieLogin", urlParameters );
                break;
            case NET_CMD_LOGOUT:
                Ret = excutePost( Url + "MblieLogout", urlParameters );
                break;
            case NET_CMD_REGISITER:
                Ret = excutePost( Url + "MblieRegister", urlParameters );
                break;

            default:
                Log.d(TAG, ">>> SenCmd 未處理 Cmd=" + Cmd );
                Ret = "";
                break;
        }
        return Ret;
    }

    public static String excutePost(String targetURL, String urlParameters) {
        URL url;
        HttpURLConnection conn = null;
        String Ret = "";

        try {
            Log.d(TAG, "===準備傳送http請求  targetURL=" + targetURL);
            Log.d(TAG, "urlParameters=" + urlParameters);
            //Create connection
            url = new URL(targetURL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            conn.setReadTimeout(50000);
            conn.setConnectTimeout(10000);
            conn.setDoOutput(true);// 设置此方法,允许向服务器输出内容

            conn.setRequestProperty("Content-Length", "" + Integer.toString(urlParameters.getBytes().length));
            conn.setRequestProperty("Content-Language", "en-US");

            conn.setUseCaches(false);     // Post cannot use caches
            conn.setDoInput(true);        // Read from the connection. Default is true.


            // Output to the connection. Default is false, set to true because post
            // method must write something to the connection
            conn.setDoOutput(true);

            //Send request
            DataOutputStream wr = new DataOutputStream(conn.getOutputStream());
            wr.writeBytes(urlParameters);
            wr.flush();
            wr.close();

            int responseCode = conn.getResponseCode();// 调用此方法就不必再使用conn.connect()方法
            Log.d(TAG, "Http 的回應 responseCode=" + responseCode);

            if( responseCode == 200 ) {
                //Get Response
                InputStream is = conn.getInputStream();
                String state = getStringFromInputStream(is);
                Log.d(TAG, "Http 的回應 state=" + state);
                Ret = state;
            }
            else
            {
                Ret = "";
                Log.d(TAG, "Http Error 的回應 responseCode=" + responseCode);
            }
            /*
            BufferedReader reader = new BufferedReader(new InputStreamReader(is));
            String line;
            StringBuilder response = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            reader.close();

            Log.d(TAG, "Http 的回應 response=" + response);
            return response.toString();
            */
        } catch (Exception e) {

            Log.d(TAG, "發生例外Exception=" + e.toString());
            Log.d(TAG, "發生例外Exception1=" + e.getMessage());
            e.printStackTrace();
            Ret = "";

        } finally {

            if (conn != null) {
                conn.disconnect();
                Log.d(TAG, "===傳送結束 http請求  關閉連線" );
            }

            Log.d(TAG, "===傳送結束 http請求  targetURL=" + targetURL);
        }

        return Ret;
    }

    private static String getStringFromInputStream(InputStream is)
            throws IOException {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        // 模板代码 必须熟练
        byte[] buffer = new byte[4096];
        int len = -1;
        // 一定要写len=is.read(buffer)
        // 如果while((is.read(buffer))!=-1)则无法将数据写入buffer中
        while ((len = is.read(buffer)) != -1) {
            os.write(buffer, 0, len);
        }
        is.close();
        String state = os.toString();// 把流中的数据转换成字符串,采用的编码是utf-8(模拟器默认编码)
        os.close();
        return state;
    }
}
