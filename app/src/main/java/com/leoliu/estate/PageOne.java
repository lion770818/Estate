package com.leoliu.estate;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;

/**
 * Created by rick on 2016/7/9.
 */

public class PageOne extends PageView {
    public PageOne(Context context) {
        super(context);
        View view = LayoutInflater.from(context).inflate(R.layout.pager_item, null);
        TextView textView = (TextView) view.findViewById(R.id.textView3);
        //textView.setText("第一頁");
        addView(view);

    }

    @Override
    public void refresh() {

    }
}
