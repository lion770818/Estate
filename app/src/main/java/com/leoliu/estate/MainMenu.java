package com.leoliu.estate;

/**
 * Created by actio on 2017/4/13.
 */

import android.content.Intent;

import android.content.res.TypedArray;
import android.support.design.widget.TabLayout;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageButton;
import android.support.design.widget.TabLayout;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MainMenu extends AppCompatActivity {

    //http://givemepass.blogspot.tw/2016/07/viewpagertablayout_9.html
    // http://www.bkjia.com/Androidjc/1100111.html
    // http://dean-android.blogspot.tw/2015/01/androidfragmenttabactivitytab.html
    // http://givemepass.blogspot.tw/2016/07/viewpager.html
    static String TAG = "MainMenu";
    private TabLayout mTablayout;
    private ViewPager mViewPager;
    private List<PageView> pageList;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_menu);

        initData();
        initView();
    }


    private void initData() {
        pageList = new ArrayList<>();
        pageList.add(new PageOne(MainMenu.this));
        pageList.add(new PageTwo(MainMenu.this));
        pageList.add(new PageThree(MainMenu.this));

        EzSharedPreferences.onCreate(this,TAG);
        EzNetWork.onCreate(this,TAG);


        String Account = EzSharedPreferences.readDataString("Account");
        String Name = EzSharedPreferences.readDataString("Name");
        int UID = EzSharedPreferences.readDataInt("UID");
    }

    private void initView() {
        mTablayout = (TabLayout) findViewById(R.id.tabs);
        //mTablayout.addTab(mTablayout.newTab().setText("輸入會員資料"));
        TabLayout.Tab tab = mTablayout.newTab();
        tab.setText("輸入會員資料");
        tab.setTag(0);
        tab.setIcon( R.drawable.notebook );
        mTablayout.addTab( tab );

        mTablayout.addTab(mTablayout.newTab().setText("5蝦咪好看"));
        //mTablayout.addTab(mTablayout.newTab().setText("翊起運動"));

        TabLayout.Tab tab2 = mTablayout.newTab();
        tab2.setText("5蝦咪好看");
        tab2.setTag(2);
        tab2.setIcon( R.drawable.home );
        mTablayout.addTab( tab2 );

        mViewPager = (ViewPager) findViewById(R.id.viewpager);
        mViewPager.setAdapter(new SamplePagerAdapter());
        initListener();
    }

    private void initListener() {
        mTablayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                Log.d(TAG,"被選擇到 =" + tab.getTag());
                mViewPager.setBackgroundResource(R.drawable.selector_tab_background);
                mViewPager.setCurrentItem(tab.getPosition());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {

            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {

            }
        });
        mViewPager.addOnPageChangeListener(new TabLayout.TabLayoutOnPageChangeListener(mTablayout));
    }

    private class SamplePagerAdapter extends PagerAdapter {

        @Override
        public int getCount() {
            return pageList.size();
        }

        @Override
        public boolean isViewFromObject(View view, Object o) {
            return o == view;
        }

        @Override
        public Object instantiateItem(ViewGroup container, int position) {
            container.addView(pageList.get(position));
            return pageList.get(position);
        }
        @Override
        public void destroyItem(ViewGroup container, int position, Object object) {
            container.removeView((View) object);
        }

    }

}
