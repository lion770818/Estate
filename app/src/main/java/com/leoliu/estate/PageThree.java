package com.leoliu.estate;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.TextView;

/**
 * Created by rick on 2016/7/9.
 */

public class PageThree extends PageView {

    public ProgressBar Loading;
    public boolean flag;
    public PageThree(Context context) {
        super(context);
        View view = LayoutInflater.from(context).inflate(R.layout.pager_item3, null);
        //TextView textView = (TextView) view.findViewById(R.id.text);
        //textView.setText("Page Three");
        //addView(view);
        /*
        Loading = (ProgressBar)view.findViewById(R.id.progressBar);
        flag = Loading.isIndeterminate();
        if( flag == true )
        {
            Loading.setMax(100);
            Loading.setProgress(10);
            Loading.setSecondaryProgress(20);
        }*/

        WebView mWebView = (WebView)view.findViewById(R.id.webView);
        WebSettings set = mWebView.getSettings();     //取得網頁相關設定
        set.setJavaScriptEnabled(true);
        //mWebView.loadUrl("http://tw.yahoo.com");
        mWebView.loadUrl("https://plus.google.com/+VAMOSSports");
        addView(view);

        mWebView.setWebViewClient(new WebViewClient() {
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;

            }

        });

    }

    @Override
    public void refresh() {

    }
}
