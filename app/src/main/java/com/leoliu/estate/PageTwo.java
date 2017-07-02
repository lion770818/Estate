package com.leoliu.estate;

import android.content.Context;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Created by rick on 2016/7/9.
 */

public class PageTwo extends PageView {
    public PageTwo(Context context) {
        super(context);
        View view = LayoutInflater.from(context).inflate(R.layout.pager_item2, null);
        TextView textView = (TextView) view.findViewById(R.id.text);
        textView.setText("Page two");
        addView(view);

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT,LayoutParams.WRAP_CONTENT);
        lp.gravity = Gravity.RIGHT;
        textView.setLayoutParams(lp);
    }

    @Override
    public void refresh() {

    }
}
