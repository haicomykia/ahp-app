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
        
        //代替案
        alts : [],

        //代替案のウエイト
        weights_of_alts : [],

        //優先度
        priorities : [],

        //優先度の順位
        priorities_rank : []
    }
    
    //目標を取得
    $("#input_goal input").on("change", function(){
        ahpParameters.goal = $(this).val();
        confirmAboutInputedText("目標", "input_criteria");
    });

    //評価基準に対して確認ダイアログを表示
    $("#exec_input_criterias").on("tap", function(){
        confirmAboutInputedText("評価基準", "input_criteria_weight");
    });

    //代替案に対して確認ダイアログを表示
    $("#exec_input_alts").on("tap", function(){
        confirmAboutInputedText("代替案", "input_first_alternative_weight");
    });

    //評価基準の重み付けを実行
    $("#compute_criteria_weight").on("tap", function(){
        ahpParameters.weights_of_criteria = returnWeight();
        calcCIBeforeChagePage("#input_alternative", ahpParameters.weights_of_criteria);
    });

    //評価基準1のもとで代替案の重み付けを実行
    $("#execute_alt_weight_1").on("tap", function(){
        ahpParameters.weights_of_alts[0] = returnWeight();
        calcCIBeforeChagePage("#input_second_alternative_weight", ahpParameters.weights_of_alts[0]);
    });

    //評価基準2のもとで代替案の重み付けを実行
    $("#execute_alt_weight_2").on("tap", function(){
        ahpParameters.weights_of_alts[1] = returnWeight();
        calcCIBeforeChagePage("#input_final_alternative_weight", ahpParameters.weights_of_alts[1]);
    });

    //評価基準3のもとで代替案の重み付けを実行
    $("#execute_alt_weight_final").on("tap", function(){
        ahpParameters.weights_of_alts[2] = returnWeight();
        calcCIBeforeChagePage("#confirm", ahpParameters.weights_of_alts[2]); 
    });

    //ページを構築時の処理
    $(document).on("pagecreate", function(event, data){
        
        //現在のページのidによって処理を分ける
        switch(event.target.id){

            //評価基準の重み付けページ
            case "input_criteria_weight":
                //非同期処理（テキストボックスから重みを取得する処理）が終わってから代替案をプリントする
                //そのために$.whenを使う
                $.when(
                    input(),
                    printCriteria()
                )

                function input(){
                    var def = new $.Deferred();

                    ahpParameters.criterias = io.setTextFromInputBox("input_criteria");

                    def.resolve();
                    return def.promise();
                }

                function printCriteria(){
                    var def = new $.Deferred();

                    var $labels = $("label", "#input_criteria_form");
                    $labels.eq(0).empty().text(io.generateLabelStr(ahpParameters.criterias[0], ahpParameters.criterias[1]));
                    $labels.eq(1).empty().text(io.generateLabelStr(ahpParameters.criterias[0], ahpParameters.criterias[2]));
                    $labels.eq(2).empty().text(io.generateLabelStr(ahpParameters.criterias[1], ahpParameters.criterias[2]));

                    def.resolve();
                    return def.promise();
                }
                break;
            
            //代替案1の重み付けページ
            case "input_first_alternative_weight":
                $.when(
                    io.inputAlts(ahpParameters, 0),
                    io.printAltsToConfirmPageLabel(ahpParameters, 0, "input_first_alternative_weight")
                )
                break;
            
            //代替案2の重み付けページ
            case "input_second_alternative_weight":
                $.when(
                    io.inputAlts(ahpParameters, 1),
                    io.printAltsToConfirmPageLabel(ahpParameters, 1, "input_second_alternative_weight")
                )
                break;
            
            //代替案３の重み付けページ
            case "input_final_alternative_weight":
                $.when(
                    io.inputAlts(ahpParameters, 2),
                    io.printAltsToConfirmPageLabel(ahpParameters, 2, "input_final_alternative_weight")
                )
                break;

            //確認ページ
            case "confirm":

                //目的をプリント
                $("#goal_text").empty().text(ahpParameters.goal);

                //評価基準をリストに表示
                io.printToList("criterias_list_elem", ahpParameters.criterias);

                //一対比較の結果を表示
                var criterias_selected_values = io.parseSelectboxValue(ahp.number_of_compair, "input_criteria_weight");

                printAltsWeight(ahpParameters.criterias, "criteria_weight", "input_criteria_weight");

                //代替案のウエイトを評価基準ごとに表示
                printAltsWeight(ahpParameters.alts, "alt-weight-under-first-ceriteria", "input_first_alternative_weight");
                printAltsWeight(ahpParameters.alts, "alt-weight-under-second-ceriteria", "input_second_alternative_weight");
                printAltsWeight(ahpParameters.alts, "alt-weight-under-final-ceriteria", "input_final_alternative_weight");
                
                //評価基準・代替案の重み付けの結果をプリント
                //printed_paramter:表示するパラメータ
                //list_class_name : ウエイトを表示するリストのクラス名
                //input_page_id:表示するウエイトが入力されたページのid属性値
                function printAltsWeight(printed_paramter, list_class_name, input_page_id){

                    var alts_selected_values = io.parseSelectboxValue(ahp.number_of_compair, input_page_id);
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

                    //代替案をリストに表示
                    io.printToList("alts_list_elem", ahpParameters.alts);

                    //考慮する代替案をプリント
                    var iter = 0;
                    $(".list-heading-criteria").each(function(){
                        $(this).text(ahpParameters.criterias[iter] + "だけを考慮したときの重み付け");
                        iter++;
                    });
                }

                break;

            //結果ページ
            case "result":
                $.when(
                    evalPriority(ahpParameters),
                    printResult(ahpParameters)
                )

                //代替案を計算して降順に順位付け
                function evalPriority(ahpParameters){
                    var def = new $.Deferred();

                    ahpParameters.priorities = ahp.clacPriority(ahpParameters.weights_of_criteria, ahpParameters.weights_of_alts);
                    ahpParameters.priorities_rank = ahp.rank(ahpParameters.priorities);
                    console.log(ahpParameters.priorities);
                    console.log(ahpParameters.priorities_rank);

                    def.resolve();
                    return def.promise();
                }
               
                //結果を表示
                function printResult(ahpParameters){
                    var def = new $.Deferred();

                    //最適な代替案を表示
                    //優先度が最大値のインデックスを返す
                    var max = ahpParameters.priorities[0];

                    var max_idx = 0;
                    for(var i = 0; i < ahp.number_of_compair; i++){
                        if(ahpParameters.priorities[i] > max){
                            max_idx = i;
                            break;
                        }
                    }
                    $("#best_alternative").text(ahpParameters.alts[max_idx]);

                    //全代替案の優先順位を表示
                    var $list = $("#other_alternatives_result").children("li");
                    $list.empty();

                    for(var i = 0; i < ahp.number_of_compair; i++){
                        $list.eq(i).text(
                            ahpParameters.alts[i] + "の優先順位は" + ahpParameters.priorities_rank[i] + "番目"
                        );
                    }

                    def.resolve();
                    return def.promise();
                }

                break;

            default:
                break;
        }
    });

    //現在のページのidを返す
    function getCurrenPageId(){
        return $.mobile.path.getLocation().split("#")[1];
    }

    //現在のページのセレクトボックスの値からウエイトを計算
    function returnWeight(){
        return ahp.calcWeight(ahp.makeCompairMatrix(io.computeImportance(ahp.number_of_compair, getCurrenPageId())));
    }

    //ページ遷移する前にCIを計算してページ遷移するかダイアログを出す
    //next_page_id:遷移先ページのid属性値
    //weight:ウエイト
    function calcCIBeforeChagePage(next_page_id, weight){

        //重要性の尺度
        var scales = io.computeImportance(ahp.number_of_compair, getCurrenPageId());
        //C.I
        const CI = ahp.clacCI(scales, weight);
        console.log(CI);

        //CIが数値ではない場合
        if(! isNaN(CI)){
            //C.Iが正常値のときかユーザが「続行」を選択した場合、ページ遷移する
            if (ahp.isCorrectCI(CI)){
                $("body").pagecontainer("change", next_page_id, {transition:"slide"});
            } else {

                const MESSAGE = '重み付けの基準に矛盾があります。\n このまま続けると正しい結果が得られない可能性があります。続けますか？';

                //cordovaのnotificationプラグインが使える場合は、cordovaの確認ダイアログを使う
                if(navigator.notification){
                    navigator.notification.confirm(
                        MESSAGE,                      //Message
                        done,                         //Callback function
                        '重みづけの基準に矛盾があります',  //Title
                        ['はい', 'いいえ']              //Buttons
                    );
                    //はいを押したらページ遷移
                    function done(buttonIndex){
                        if(buttonIndex === 1){
                            $("body").pagecontainer("change", next_page_id, {transition:"slide"});
                        }
                    }
                } else{
                    //使えない場合はJavaScriptのconfirmダイアログを表示させる
                    if(confirm(MESSAGE)){
                        $("body").pagecontainer("change", next_page_id, {transition:"slide"});
                    }
                }
            }
        } else {
            //重み付けされていない項目がある場合はアラートを表示
            var MESSAGE = 
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
                    return -1;
                }
            } else {
                //使えない場合はJavaScriptのalert関数で代用
                alert(MESSAGE);
                return -1;
            }
        }
    }

    //テキストボックスに入力された値に対して確認ダイアログを表示
    //confirmParameter : 確認したいAHPのパラメータ
    //next_page_id:遷移先ページのid属性値
    function confirmAboutInputedText(confirmParameter ,next_page_id){

        //テキストボックスに入力された値
        var texts = io.setTextFromInputBox(getCurrenPageId());
        //アラートに表示するテキスト
        var alertText = "";

        //確認したいAHPのパラメータが2つ以上の場合は、「パラメータ : n番目の入力値」で表示
        if(texts.length > 1){
            for(var i = 0; i < texts.length; i++){
                alertText += confirmParameter + (i + 1) + ":" + texts[i] + "\n";
            }
        } else {
            //１つの場合は「パラメータ：入力値」で表示
            alertText += confirmParameter + ":" + texts + "\n";
        }
        
        alertText = "次の" + confirmParameter + "を入力しました.\n" + alertText;

        //cordovaのnotificationプラグインが使える場合は、cordovaのアラートを使う
        if(navigator.notification){
            navigator.notification.alert(
                alertText,
                done,
                confirmParameter + "の確認",
                "OK"
            );
            //ボタンを押したらページ遷移
            function done(){
                $("body").pagecontainer("change", "#" + next_page_id, {transition:"slide"});
            }
        } else {
            //使えない場合はJavaScriptのalert関数で代用
            alert(alertText);
            $("body").pagecontainer("change", "#" + next_page_id, {transition:"slide"});
        }
    }
});

//出入力の処理
var io = {
    //選択されたセレクトボックスのvalue属性値を配列に格納して返す
    parseSelectboxValue : function(number_of_elem, page_id){
        var selectbox_values = new Array(number_of_elem);
        var iter = 0;

        $("#" + page_id + " option:selected").each(function(){
            selectbox_values[iter] = parseInt($(this).val(), 10);
            iter++;
        });

        return selectbox_values;
    },

    //セレクトボックスから重要性の尺度を取得
    computeImportance : function(number_of_elem, page_id){
        //一対比較の結果の配列
        var pair_compair_values = new Array(number_of_elem);
        //セレクトボックスのvalue属性値を取得
        var selected_values = io.parseSelectboxValue(number_of_elem, page_id);

        for(var i = 0; i < number_of_elem; i++){
            pair_compair_values[i] = ahp.SCALES[selected_values[i]];
        }

        return pair_compair_values;
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

    //代替案の重み付けページに評価基準と比較のためのlabel文字列をプリント
    printAltsToConfirmPageLabel : function(ahpParameters, active_criteria_number, page_id){
        var def = new $.Deferred();

        page_id = "#" + page_id;

        $(".active_criteria", page_id).empty().text(ahpParameters.criterias[active_criteria_number]);

        var $labels = $("label", page_id);

        $labels.eq(0).empty().text(io.generateLabelStr(ahpParameters.alts[0], ahpParameters.alts[1]));
        $labels.eq(1).empty().text(io.generateLabelStr(ahpParameters.alts[0], ahpParameters.alts[2]));
        $labels.eq(2).empty().text(io.generateLabelStr(ahpParameters.alts[1], ahpParameters.alts[2]));

        def.resolve();
        return def.promise();
    },

    //代替案を取得して代入
    inputAlts : function(ahpParameters, page_id){
        var def = new $.Deferred();

        ahpParameters.alts = io.setTextFromInputBox("input_alternative");

        def.resolve();
        return def.promise();
    },

    //比較のためのlabel文字列を生成
    generateLabelStr : function(compare_str, compared_str){
        return compare_str + "は" + compared_str + "よりどれくらい重要ですか";
    },

    //確認表示のためのlabel文字列を生成
    generateLabelStrForConfirm : function(compare_str, compared_str, idx){
        const WEIGHT_TBL = [
            "極めて重要ではない", "非常に重要ではない", "かなり重要ではない", 
            "少しくらい重要ではない","少しくらい重要", "少し重要",
            "かなり重要", "非常に重要", "極めて重要", ""
        ];

        if(idx === WEIGHT_TBL.length - 1){
            return "重み付けされていません";
        } else {
            return compare_str + "は" + compared_str + "より" + WEIGHT_TBL[idx] + "と重み付けしました.";
        }
    },

    //li要素に配列の各要素の値をプリント
    //ol_ul_id_name:ol要素またはul要素のid名
    //printedAry:プリントされる配列
    printToList : function(ol_ul_id_name, printedAry){
        var $lists = $("#" + ol_ul_id_name).children("li");
        $lists.empty();
        for(var i = 0; i < $lists.length; i++){
            $lists.eq(i).text(printedAry[i]);
        }
    }
}

//AHPで使う関数をまとめたオブジェクト
var ahp = {

    number_of_compair : 3,                                                    //評価基準・代替案の要素数
    SCALES : [0.11111111, 0.14285714, 0.2, 0.3333333, 1, 3, 5, 7, 9, null],      //重要性の尺度（重み付けされてないときは最後の要素を参照して1）

    //比較行列を生成するメソッドを定義
    //var_scale：評価基準・代替案の評価値
    makeCompairMatrix : function(var_scale){

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
    calcWeight : function(comparison_matrix){


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
    //注意：jQuery Mobileと一緒に実行すると
    //var_scale：評価基準・代替案の評価値 （重要性の尺度）
    //weights：評価基準・代替案の重み
    clacCI : function(var_scale, weights){

        //整合度指数(C.I)を求めるための配列
        var ci_elem = [];
        //ペア比較マトリックス
        var scale_tbl = ahp.makeCompairMatrix(var_scale);

        //各評価基準（代替案）の重要性の尺度 × ウエイトの合計を求める
        for (var i = 0; i < scale_tbl.length; i++) {
            ci_elem[i] = 0;
            for (var j = 0; j < scale_tbl[i].length; j++) {
                ci_elem[i] += scale_tbl[i][j] * weights[j];
            }
        }

        //合計を各要素の重みで割る
        for (i = 0; i < ci_elem.length; i++) {
            ci_elem[i] = ci_elem[i] / weights[i];
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
        const MAX_CI = 0.15;                          //C.Iの正常値
        return ci < MAX_CI ? true : false;
    },

    //総合評価を行う
    clacPriority : function(weights_criteria, weights_alts){

        var priorities = [];					//総合重要度が入る配列

        //行列の乗算をして、総合重要度を求める
        for(var i = 0; i < ahp.number_of_compair; i++){
            priorities[i] = 0;
            for(var j = 0; j < weights_alts[i].length; j++){
                priorities[i] += weights_criteria[i] * weights_alts[i][j];
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
