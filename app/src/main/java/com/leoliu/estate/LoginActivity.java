package com.leoliu.estate;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Message;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import com.google.android.gms.appindexing.Action;
import com.google.android.gms.appindexing.AppIndex;
import com.google.android.gms.common.api.GoogleApiClient;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
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


public class LoginActivity extends AppCompatActivity {

    static String TAG = "LoginActivity";
    /**
     * ATTENTION: This was auto-generated to implement the App Indexing API.
     * See https://g.co/AppIndexing/AndroidStudio for more information.
     */
    private GoogleApiClient client;

    private EditText EditAccount;
    private EditText EditPassword;
    private String AccountStr = "";
    private String PasswordStr = "";

    private boolean IsLoop = true;
    private Thread thread;
    private ProgressDialog Loadingdialog;

    private Handler mHandlerCtrl = new Handler();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);

        EzNetWork.onCreate(this,TAG);

        // 抓uuid
        // http://blog.mosil.biz/2014/05/android-device-id-uuid/#randomUUID
        //String uuid = UUID.randomUUID().toString();
        //Log.d(TAG,"uuid=" + uuid );
        TelephonyManager tm = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
        String deviceId = tm.getDeviceId();
        Log.d(TAG, "deviceId=" + deviceId);

        EditAccount = (EditText)findViewById(R.id.Account);
        EditPassword = (EditText)findViewById(R.id.Password);

        // 登錄
        ImageButton button = (ImageButton) findViewById(R.id.login_button);
        button.setOnClickListener(new ImageButton.OnClickListener() {

            @Override
            public void onClick(View v) {

                // 抓帳秘
                IsLoop = true;
                AccountStr = EditAccount.getText().toString();
                PasswordStr = EditPassword.getText().toString();
                Loadingdialog = ProgressDialog.show(LoginActivity.this, "登錄中", "請耐心等待3秒...",true);
                //HttpPost httpRequest = new HttpPost("http://13.113.26.157:3000/MblieLogin");

                //HttpPost httpRequest = new HttpPost("http://13.113.26.157:3000/MblieLogin");

                thread = new Thread(new Runnable() {
                    @Override
                    public void run() {
                        // TODO Auto-generated method stub
                        while(IsLoop){
                            try{

                                // 登入中
                                EzNetWork.Url =  "http://52.196.121.132:3000/";
                                String ret = EzNetWork.SenCmd( NET_CMD.NET_CMD_LOGIN, "UID=1&Account=cat111&PassWord=1234");
                                Log.d(TAG, "excutePost str=" + ret);

                                int Code = new JSONObject(ret).getInt("Code");
                                if( Code == 0 )
                                {
                                    Message msg = new Message();
                                    msg.what = 1;
                                    mHandler.sendMessage(msg);
                                }
                                else
                                {
                                    Message msg = new Message();
                                    msg.what = 0;
                                    mHandler.sendMessage(msg);
                                }


                                IsLoop = false;
                                Loadingdialog.dismiss();
                                Thread.sleep(500);
                            }
                            catch(Exception e){
                                e.printStackTrace();
                                IsLoop = false;
                                Loadingdialog.dismiss();
                                Message msg = new Message();
                                msg.what = 0;
                                mHandler.sendMessage(msg);
                                Log.d(TAG, "Exception=" + e.toString());
                            }
                        }
                    }
                });

                thread.start();
            }

        });
        // ATTENTION: This was auto-generated to implement the App Indexing API.
        // See https://g.co/AppIndexing/AndroidStudio for more information.
        client = new GoogleApiClient.Builder(this).addApi(AppIndex.API).build();



    }
/*
    Handler handler=new Handler() {
        @Override
        public void handleMessage(Message msg) {
            Log.d(TAG, "handleMessage msg=" + msg);
            //bar.incrementProgressBy(5);
            //textView.setText(""+(msg.arg1==0 ? 1 : msg.arg1+1 )*5+" %");

        }
    };
*/

    // http://rx1226.pixnet.net/blog/post/305873256-%5Bandroid%5D-10-1-%E5%9F%BA%E7%A4%8Edialog
    private void setAlertDialog1Event( String Message ){

        AlertDialog.Builder builder = new AlertDialog.Builder( LoginActivity.this);

        builder.setTitle("錯誤");
        builder.setMessage(Message);
        builder.setPositiveButton("關閉", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User clicked OK button
            }
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private Handler mHandler = new Handler(){
        @Override
        public void handleMessage(Message msg) {
            Log.d(TAG, "handleMessage msg=" + msg);
            switch(msg.what){
                case 0:

                    setAlertDialog1Event("登入錯誤");
                    break;
                case 1:

                    GotoMainMenu();
                    break;

                default:
                    Log.d(TAG, " 未處理的 msg=" + msg);
                    break;
            }
        }
    };

/*
    public static String excutePost(String targetURL, String urlParameters) {
        URL url;
        HttpURLConnection conn = null;


        try {
            Log.d(TAG, "targetURL=" + targetURL);
            Log.d(TAG, "urlParameters=" + urlParameters);
            //Create connection
            url = new URL(targetURL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type",
                    "application/x-www-form-urlencoded");

            conn.setRequestProperty("Content-Length", "" +
                    Integer.toString(urlParameters.getBytes().length));
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

            //Get Response
            InputStream is = conn.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(is));
            String line;
            StringBuilder response = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            reader.close();

            Log.d(TAG, "response=" + response);
            return response.toString();

        } catch (Exception e) {

            Log.d(TAG, "Exception=" + e.toString());
            Log.d(TAG, "Exception1=" + e.getMessage());
            e.printStackTrace();
            return null;

        } finally {

            if (conn != null) {
                conn.disconnect();
            }
        }
    }*/
    @Override
    public void onStart() {
        super.onStart();

        // ATTENTION: This was auto-generated to implement the App Indexing API.
        // See https://g.co/AppIndexing/AndroidStudio for more information.
        client.connect();
        Action viewAction = Action.newAction(
                Action.TYPE_VIEW, // TODO: choose an action type.
                "Main Page", // TODO: Define a title for the content shown.
                // TODO: If you have web page content that matches this app activity's content,
                // make sure this auto-generated web page URL is correct.
                // Otherwise, set the URL to null.
                Uri.parse("http://host/path"),
                // TODO: Make sure this auto-generated app URL is correct.
                Uri.parse("android-app://com.leoliu.estate/http/host/path")
        );
        AppIndex.AppIndexApi.start(client, viewAction);
    }

    @Override
    public void onStop() {
        super.onStop();

        // ATTENTION: This was auto-generated to implement the App Indexing API.
        // See https://g.co/AppIndexing/AndroidStudio for more information.
        Action viewAction = Action.newAction(
                Action.TYPE_VIEW, // TODO: choose an action type.
                "Main Page", // TODO: Define a title for the content shown.
                // TODO: If you have web page content that matches this app activity's content,
                // make sure this auto-generated web page URL is correct.
                // Otherwise, set the URL to null.
                Uri.parse("http://host/path"),
                // TODO: Make sure this auto-generated app URL is correct.
                Uri.parse("android-app://com.leoliu.estate/http/host/path")
        );
        AppIndex.AppIndexApi.end(client, viewAction);
        client.disconnect();
    }

    //
    public void GotoMainMenu(){

        // 登入成功 轉到第二頁
        Intent intent = new Intent();
        //從MainActivity 到Main2Activity
        intent.setClass(LoginActivity.this, MainMenu.class);
        //開啟Activity
        startActivity(intent);
    }
/*
    //宣告一個新的類別並擴充Thread
    class HttpThread extends Thread {

        //宣告變數並指定預設值
        public String MyName = "NoData";
        public String MyMessage = "Nodata";
        public String Url = "http://192.168.1.49/test/test.php";

        @Override
        public void run() {
            // TODO Auto-generated method stub
            super.run();

            //宣告一個新的Bundle物件，Bundle可以在多個執行緒之間傳遞訊息
            Bundle myBundle = new Bundle();

            try {
                HttpClient client = new DefaultHttpClient();
                URI website = new URI(this.Url);

                //指定POST模式
                HttpPost request = new HttpPost();

                //POST傳值必須將key、值加入List<NameValuePair>
                List<NameValuePair> parmas = new ArrayList<NameValuePair>();

                //逐一增加POST所需的Key、值
                parmas.add(new BasicNameValuePair("MyName", this.MyName));
                parmas.add(new BasicNameValuePair("MyMessage", this.MyMessage));

                //宣告UrlEncodedFormEntity來編碼POST，指定使用UTF-8
                UrlEncodedFormEntity env = new UrlEncodedFormEntity(parmas, HTTP.UTF_8);
                request.setURI(website);

                //設定POST的List
                request.setEntity(env);

                HttpResponse response = client.execute(request);
                HttpEntity resEntity = response.getEntity();
                if (resEntity != null) {
                    myBundle.putString("response", EntityUtils.toString(resEntity));
                } else {
                    myBundle.putString("response", "Nothing");
                }

                Message msg = new Message();
                msg.setData(myBundle);
                mHandler.sendMessage(msg);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }*/
}
