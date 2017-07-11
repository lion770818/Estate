package com.leoliu.estate;

import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Log;

/**
 * Created by actio on 2017/7/9.
 */
public class EzSharedPreferences {

    private static Activity mActivity;
    static String TAG = "EzSharedPreferences";
    private static SharedPreferences settings;
    private static final String data = "SAVE_DATA";

    //***********************************************************************************************************
    // 創建
    //***********************************************************************************************************
    public static void onCreate(Activity activity, String project_name) {
        Log.d(TAG, "onCreate");

        mActivity = activity;
        settings = mActivity.getSharedPreferences(data,0);
    }

    // 讀取資料
    public static String readDataString( String Key){
        String Value = "";
        Value = settings.getString(Key, "");
        return Value;
    }
    public static int readDataInt( String Key){
        int Value = 0;
        Value = settings.getInt(Key, 0);
        return Value;
    }

    // 儲存資料
    public static void SaveData( String Key, String Value ){

        settings.edit().putString(Key, Value).commit();
    }
    public static void SaveData( String Key, int Value ){

        settings.edit().putInt(Key, Value).commit();
    }
}
