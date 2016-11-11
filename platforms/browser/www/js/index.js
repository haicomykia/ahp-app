/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

//GUIの操作に応じてAHPをインタラクティブに実行し、ページの内容を変える
$(function(){
    //AHPでユーザが入力する値をまとめたオブジェクト
    var ahpParameters = {
        //総合目的
        goal : "",

        //評価基準
        criterias : [],

        //評価基準のウエイト
        weights_of_criteria : [],
        
        //選択肢（代替案）
        alts : [],

        //選択肢（代替案）のウエイト
        weights_of_alts : [],

        //優先度
        priorities : [],

        //優先度の順位
        priorities_rank : []
    }
    
    //目標を取得
    $("#input_goal input").on("change", function(){
        ahpParameters.goal = $(this).val();
        if(ahpParameters.goal !== ""){
            dialogs.showConfirm("目標" ,ahpParameters.goal);
        }
    });

    //評価基準を取得
    var $criteria_inputbox = $('input[type="text"]', "#input_criteria");
    $criteria_inputbox.on("change", function(){
        ahpParameters.criterias[$criteria_inputbox.index(this)] = $(this).val();
        if(ahpParameters.criterias.length >= ahp.number_of_compair){
            dialogs.showConfirm("評価基準", ahpParameters.criterias);
            $("#input_criterias_btn").removeClass('ui-state-disabled'); 
        }
    });
    
    //評価基準の重み付けを実行
    $('[name="select_criteria_weight"]').on("change", function(){
        var ci = returnCI();
        var $btn = $("#criteria_weight_btn");
        
        //C.Iが正常値ならボタンを有効化し、ウエイトを代入
        if(ahp.isCorrectCI(ci)){
            $btn.removeClass('ui-state-disabled');
            ahpParameters.weights_of_criteria = returnWeight();
        } else {
            //数値ならば一対比較が正しくできていないことを示すアラートを出す.
            if(! isNaN(ci)){
                dialogs.showNotCorrectCI();
            }
            $btn.addClass('ui-state-disabled');
        }
        console.log(ci);
    });

     //選択肢（代替案）を取得
    var $alt_inputbox = $('input[type="text"]', "#input_alternative");
    $alt_inputbox.on("change", function(){
        ahpParameters.alts[$alt_inputbox.index(this)] = $(this).val();
        if(ahpParameters.alts.length >= ahp.number_of_compair){
            dialogs.showConfirm("選択肢（代替案）", ahpParameters.alts);
            $("#input_alternative_btn").removeClass('ui-state-disabled'); 
        }
    });

    //評価基準1のもとで選択肢（代替案）の重み付けを実行
    $('[name="select_second_alt_weight"]').on("change", function(){
        var ci = returnCI();
        var $btn = $("#second_alts_weight_btn");
        
        if(ahp.isCorrectCI(ci)){
            $btn.removeClass('ui-state-disabled');
            ahpParameters.weights_of_alts[0] = returnWeight();
        } else {
            if(! isNaN(ci)){
                dialogs.showNotCorrectCI();
            }
            $btn.addClass('ui-state-disabled');
        }
        console.log(ci);
    });


    //評価基準2のもとで選択肢（代替案）の重み付けを実行
    $('[name="select_first_alt_weight"]').on("change", function(){
        var ci = returnCI();
        var $btn = $("#first_alts_weight_btn");
        
        if(ahp.isCorrectCI(ci)){
            $btn.removeClass('ui-state-disabled');
            ahpParameters.weights_of_alts[1] = returnWeight();
        } else {
            if(! isNaN(ci)){
                dialogs.showNotCorrectCI();
            }
            $btn.addClass('ui-state-disabled');
        }
        console.log(ci);
    });

    //評価基準3のもとで選択肢（代替案）の重み付けを実行
    $('[name="select_third_alt_weight"]').on("change", function(){
        var ci = returnCI();
        var $btn = $("#third_alts_weight_btn");
        
        if(ahp.isCorrectCI(ci)){
            $btn.removeClass('ui-state-disabled');
            ahpParameters.weights_of_alts[2] = returnWeight();
        } else {
            if(! isNaN(ci)){
                dialogs.showNotCorrectCI();
            }
            $btn.addClass('ui-state-disabled');
        }
        console.log(ci);
    });

    //新しいページを表示した後の処理
    $(document).on("pagecontainershow", function(event, data){
        
        //ページのidによって処理を分ける
        //評価基準入力ページ
        if(data.toPage.is("#input_criteria" || "#input_alternative" )){
            io.printGoal(ahpParameters.goal);
        }   

        //評価基準の重み付けページ
        if(data.toPage.is("#input_criteria_weight")){
            io.printGoal(ahpParameters.goal);
            var $labels = $("label", "#input_criteria_form");
            $labels.eq(0).empty().text(io.generateLabelStr(ahpParameters.criterias[0], ahpParameters.criterias[1]));
            $labels.eq(1).empty().text(io.generateLabelStr(ahpParameters.criterias[0], ahpParameters.criterias[2]));
            $labels.eq(2).empty().text(io.generateLabelStr(ahpParameters.criterias[1], ahpParameters.criterias[2]));
        }

        //選択肢（代替案）1の重み付けページ
        if(data.toPage.is("#input_first_alternative_weight")){
            io.printGoal(ahpParameters.goal);
            ahpParameters.alts = io.setTextFromInputBox("input_alternative");
            io.printAltsToConfirmPageLabel(ahpParameters, 0, "input_first_alternative_weight");
        }

        //選択肢（代替案）2の重み付けページ
        if(data.toPage.is("#input_second_alternative_weight")){
            io.printGoal(ahpParameters.goal);
            io.printAltsToConfirmPageLabel(ahpParameters, 1, "input_second_alternative_weight");
        }

        //選択肢（代替案）３の重み付けページ
        if(data.toPage.is("#input_third_alternative_weight")){
            io.printGoal(ahpParameters.goal)();
            io.printAltsToConfirmPageLabel(ahpParameters, 2, "input_third_alternative_weight");
        }

        //確認ページ
        if(data.toPage.is("#confirm")){
            //目的をプリント
            io.printGoal(ahpParameters.goal);

            //評価基準をリストに表示
            io.printToList("criterias_list_elem", ahpParameters.criterias);

            printAltsWeight(ahpParameters.criterias, "criteria_weight", "input_criteria_weight");

            //選択肢（代替案）のウエイトを評価基準ごとに表示
            printAltsWeight(ahpParameters.alts, "alt-weight-under-first-ceriteria", "input_first_alternative_weight");
            printAltsWeight(ahpParameters.alts, "alt-weight-under-second-ceriteria", "input_second_alternative_weight");
            printAltsWeight(ahpParameters.alts, "alt-weight-under-third-ceriteria", "input_third_alternative_weight");
            
            //評価基準・選択肢（代替案）の重み付けの結果をプリント
            //printed_paramter:表示するパラメータ
            //list_class_name : ウエイトを表示するリストのクラス名
            //input_page_id:表示するウエイトが入力されたページのid属性値
            function printAltsWeight(printed_paramter, list_class_name, input_alts_weight_page_id){

                var alts_selected_values = io.parseSelectboxValue(input_alts_weight_page_id);
                var $list_elem = $("#confirm ol").children("." + list_class_name);

                $list_elem.empty();

                $list_elem.eq(0).text(
                    io.generateLabelStrForConfirm(printed_paramter[0], printed_paramter[1], alts_selected_values[0])
                );
                $list_elem.eq(1).text(
                    io.generateLabelStrForConfirm(printed_paramter[0], printed_paramter[2], alts_selected_values[1])
                );
                $list_elem.eq(2).text(
                    io.generateLabelStrForConfirm(printed_paramter[1], printed_paramter[2], alts_selected_values[2])
                );

                //選択肢（代替案）をリストに表示
                io.printToList("alts_list_elem", ahpParameters.alts);

                //考慮する選択肢（代替案）をプリント
                var iter = 0;
                $(".list-heading-criteria").each(function(){
                    $(this).text(ahpParameters.criterias[iter] + "だけを考慮したときの重み付け");
                    iter++;
                });
            }
        }

        //結果ページ
        if(data.toPage.is("#result")){
    
            ahpParameters.priorities = ahp.clacPriority(ahpParameters.weights_of_criteria, ahpParameters.weights_of_alts);
            ahpParameters.priorities_rank = ahp.rank(ahpParameters.priorities);
            console.log(ahpParameters.priorities);

            //総合目的
            $("#resolved_goal").text(ahpParameters.goal);

            //最適な選択肢（代替案）を表示
            //優先度が1位のインデックスを表示
            for(var max_idx = 0; max_idx < ahp.number_of_compair; max_idx++){
                if(ahpParameters.priorities_rank[max_idx] === 1){
                    $("#best_alternative").text(ahpParameters.alts[max_idx]);
                    break;
                }
            }
            

            //全選択肢（代替案）の棒グラフになるli要素
            var $list = $("#other_alternatives_result").children("li");
    
            //DOM操作で棒グラフを描く
            for(var i = 0; i < $list.length; i++){
                var weight_raito = Math.round(ahpParameters.priorities[i] * 100);
                $list.eq(i).css({
                    "width" : weight_raito + "%"
                }).text(ahpParameters.alts[i] + ": " + weight_raito + "%").addClass("result_" + (i + 1));
            }
        }
    });

    //現在のページのセレクトボックスの値からウエイトを計算
    function returnWeight(){
        return ahp.calcWeight(io.getSelectedScale());
    }

    //現在のページのセレクトボックスの値からC.Iを計算
    function returnCI(){
        return ahp.clacCI(io.getSelectedScale());
    }
});

//ダイアログを出す処理
var dialogs = {

    //重み付けされていない項目がある場合はアラートを表示
    showHasNotWeighted : function(){
        const MESSAGE = 
        "重み付けされていない項目があります。\n 「OK」をクリックして重み付けを行ってください。\n「詳しい手順はこちら」をクリックすると重み付けの説明が見られます。";

        if(navigator.notification){
            navigator.notification.alert(
                MESSAGE,
                done,
                "重み付けされていない項目があります",
                "OK"
            );
            //ボタンを押したらページ遷移しない
            function done(){
                return false;
            }
        } else {
            //使えない場合はJavaScriptのalert関数で代用
            alert(MESSAGE);
            return false;
        }
    },

    //C.Iが異常値のとき
    showNotCorrectCI : function(){
        const MESSAGE = '重み付けの基準に矛盾があります。\n 重み付けをやり直してください.';

        //cordovaのnotificationプラグインが使える場合は、cordovaの確認ダイアログを使う
        if(navigator.notification){
            navigator.notification.alert(
                MESSAGE,                      //Message
                done,                         //Callback function
                '重みづけによる優先度に矛盾があります',  //Title
                'OK'                          //Buttons
            );
            //はいを押したらページ遷移
            function done(){
                return false;
            }
        } else{
            //使えない場合はJavaScriptのalertダイアログを表示させる
            if(alert(MESSAGE)){
                return false;
            }
        }
    },

    //入力した値の確認ダイアログを出す
    showConfirm : function(printed_paramter_name, confirmed_parameter){
        var message = "";

        if(typeof confirmed_parameter === "string") {
            message = printed_paramter_name + "「" + confirmed_parameter + "」を入力しました. \n";
        } else if($.isArray(confirmed_parameter)) {
            message = "次の" + printed_paramter_name + "を入力しました. \n";
            for(var i = 0; i < ahp.number_of_compair; i++){
                message = message + printed_paramter_name + (i + 1) + ":" + confirmed_parameter[i] + "\n";
            }
        } else {
            message = "異常な値が入力されました." + printed_paramter_name + "を入力してください.";
        }

        if(navigator.notification){
            navigator.notification.alert(
                message,                      //Message
                done,                         //Callback function
                '入力の確認',                   //Title
                'OK'                          //Buttons
            );
        //はいを押したらページ遷移
            function done(){
                return 0; 
            }
        } else{
            alert(message);
            return 0;
        }
    } 
}

//出入力の処理
var io = {
    //現在のページのid属性値を返す
    getCurrentPageId : function(){
        return $.mobile.path.getLocation().split("#")[1];
    },

    //セレクトボックスから重要性の尺度を取得
    //選択されていない場合はnull値が設定される.
    //評価基準・選択肢（代替案）の要素数とセレクトボックスの数が対応しているという前提で動く.
    getSelectedScale : function(){
        var var_scale = [];

        var elem = $("select", "#" + io.getCurrentPageId());
        for(var i = 0; i < elem.length; i++){
            var_scale[i] = ahp.SCALES[parseInt($("option:selected", elem.eq(i)).val(), 10)];
        }

        return var_scale;
    },

    //インプットボックスの値を配列に格納
    setTextFromInputBox : function(page_id){
        var $inputs = $("#" + page_id + ' input[type="text"]'); 
        var ary = [];
        for(var i = 0; i < $inputs.length; i++){
            var t = $inputs.eq(i).val();
            ary[i] = (t === "") ? "" : t;
        }
        return ary;
    },

    //指定したページにあるセレクトボックスのvalue属性値を取得
    //source_page_id:取得するページのid
    parseSelectboxValue : function(source_page_id){

        var $options = $("option:selected", "#" + source_page_id);
        var values = [];

        for(var i = 0; i < $options.length; i++){
            values[i] = parseInt($options.eq(i).val(), 10);
        }

        return values;
    },

    //総合目的をプリント
    printGoal: function(goal){
        $(".level-goal", "#" + io.getCurrentPageId()).text("目標：" + goal);
    },

    //選択肢（代替案）の重み付けページに評価基準と比較のためのlabel文字列をプリント
    printAltsToConfirmPageLabel : function(ahpParameters, active_criteria_number, input_alts_weight_page_id){

        input_alts_weight_page_id = "#" + input_alts_weight_page_id;

        $(".active_criteria", input_alts_weight_page_id).empty().text(ahpParameters.criterias[active_criteria_number]);

        var $labels = $("label", input_alts_weight_page_id);

        $labels.eq(0).empty().text(io.generateLabelStr(ahpParameters.alts[0], ahpParameters.alts[1]));
        $labels.eq(1).empty().text(io.generateLabelStr(ahpParameters.alts[0], ahpParameters.alts[2]));
        $labels.eq(2).empty().text(io.generateLabelStr(ahpParameters.alts[1], ahpParameters.alts[2]));

    },

    //比較のためのlabel文字列を生成
    generateLabelStr : function(compare_str, compared_str){
        return compare_str + "は" + compared_str + "よりどれくらい重要ですか";
    },

    //確認表示のためのlabel文字列を生成
    generateLabelStrForConfirm : function(compare_str, compared_str, idx){

        if (ahp.SCALES[idx] === null) return "重み付けされていません";

        const WEIGHT_TBL = [
            "極めて重要ではない", "非常に重要ではない", "かなり重要ではない", 
            "少しくらい重要ではない","同じくらい重要", "少し重要",
            "かなり重要", "非常に重要", "極めて重要", ""
        ];

        return compare_str + "は" + compared_str + "より" + WEIGHT_TBL[idx] + "と重み付けしました.";
    },

    //li要素に配列の各要素の値をプリント
    //list_id_name:ol要素またはul要素のid名
    //printedAry:プリントされる配列
    printToList : function(list_id_name, printed_ary){
        var $lists = $("#" + list_id_name).children("li");
        $lists.empty();
        for(var i = 0; i < $lists.length; i++){
            $lists.eq(i).text(printed_ary[i]);
        }
    }
}

//AHPで使う関数をまとめたオブジェクト
var ahp = {

    number_of_compair : 3,                                                    //評価基準・選択肢（代替案）の要素数
    SCALES : [0.1111, 0.1428, 0.2, 0.3333, 1, 3, 5, 7, 9, null],   //重要性の尺度（重み付けされてないときは最後の要素を参照してnull）

    //比較行列を生成するメソッドを定義
    //var_scale：評価基準・選択肢（代替案）の評価値
    makeCompairMatrix : function(var_scale){

        console.log(var_scale);

        var comparison_matrix = [];			                                    //比較行列
        for (var i = 0; i < ahp.number_of_compair; i++) {
            comparison_matrix[i] = new Array(ahp.number_of_compair);
        }

        var args_index = 0;									 					//何番目の尺度を代入するか数えるカウンタ

        //一対比較の結果を二次元配列comparison_matrixに代入
        for (var i = 0; i < ahp.number_of_compair; i++) {
            for (var j = i + 1; j < comparison_matrix[i].length; j++) {

                //一対比較の結果はarguments[0][args_index]に代入
                comparison_matrix[i][j] = arguments[0][args_index];
                args_index++;
            }
        }
    
        //残りの部分を決定
        for (var target = 0; target < ahp.number_of_compair; target++) {
            comparison_matrix[target][target] = 1;                          //対角要素に１を代入
            for (var pair_i = target + 1; pair_i < comparison_matrix[target].length; pair_i++) {
                comparison_matrix[pair_i][target] = 1 / comparison_matrix[target][pair_i];
            }
        }

        return comparison_matrix;
    },

    //ウエイトの算出
    calcWeight : function(var_scale){

        //比較行列
        var comparison_matrix = ahp.makeCompairMatrix(var_scale);
        //幾何平均の配列
	    var geometric_means = [];

        //幾何平均を求める
        for (var target = 0; target < comparison_matrix.length; target++) {
            geometric_means[target] = 1;
            for (var index = 0; index < comparison_matrix[target].length; index++) {
                geometric_means[target] *= comparison_matrix[target][index];
            }
            geometric_means[target] = Math.pow(geometric_means[target], (1 / this.number_of_compair));
        }

        var weights = [];										//ウエイトが入る配列

        var sum = 0;											//幾何平均の合計が入る変数

        //幾何平均の合計を求める
        geometric_means.forEach(function(elem, index, array){
            sum += elem;
        });

        //各項目の幾何平均÷幾何平均の合計から、ウエイトを求める
        geometric_means.forEach(function(elem, index, array) {
            weights[index] = elem / sum;
        });

	    return weights;
    },

    //整合度指数を返す
    //var_scale：評価基準・選択肢（代替案）の評価値 （重要性の尺度）
    clacCI : function(var_scale){

        //整合度指数(C.I)を求めるための配列
        var ci_elem = [];
        //ペア比較マトリックス
        var scale_tbl = ahp.makeCompairMatrix(var_scale);
        //ウエイト
        var weight = ahp.calcWeight(var_scale);

        //各評価基準（選択肢（代替案））の重要性の尺度 × ウエイトの合計を求める
        for (var i = 0; i < scale_tbl.length; i++) {
            ci_elem[i] = 0;
            for (var j = 0; j < scale_tbl[i].length; j++) {
                ci_elem[i] += scale_tbl[i][j] * weight[j];
            }
        }

        //合計を各要素の重みで割る
        for (i = 0; i < ci_elem.length; i++) {
            ci_elem[i] = ci_elem[i] / weight[i];
        }

        var avg = 0;
        ci_elem.forEach(function(e, i, a) {
            avg += e;
        });
        avg /= ahp.number_of_compair;

        return (avg - ahp.number_of_compair) / (ahp.number_of_compair - 1);
    },

    //C.Iが正常値かチェックする
    isCorrectCI : function(ci){
        const MAX_CI = 0.15;                        //C.Iの正常値
        return ci < MAX_CI ? true : false;          //正常値ならばtrueを返す
    },  

    //総合評価を行う
    clacPriority : function(weights_criteria, weights_alts){

        var priorities = [];					//総合重要度が入る配列

        //行列の乗算をして、総合重要度を求める
        for(var i = 0; i < ahp.number_of_compair; i++){
            priorities[i] = 0;
            for(var j = 0; j < weights_alts[i].length; j++){
                priorities[i] += weights_criteria[j] * weights_alts[j][i];
            }
        }

        return priorities;
    },

    //優先順位の順位を求める.
    rank : function(priority){

        var ranks = [];                         //順位が入る
        for (var i = 0; i < priority.length; i++) {
            ranks[i] = 1;
        }

        //順位付け
        for (var target = 0; target < priority.length - 1; target++) {
            for (var index = target + 1; index < priority.length; index++) {
                if (priority[target] < priority[index]) {
                    ranks[target]++;
                } else if (priority[target] > priority[index]) {
                    ranks[index]++;
                }
            }
        }

        return ranks;
    }
}
