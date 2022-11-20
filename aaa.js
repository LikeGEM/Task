/***

For Quantumult-X 598+ ONLY!!

[task_local]
event-interaction https://raw.githubusercontent.com/LovedGM/Task/main/YT-AD.js, tag=YouTube 广告检测, img-url= https://github.com/LikeGEM/TuBiao/raw/main/Icons/YouTube.png, enabled=true

// Cron 定时切换版本
0 8 * * * https://raw.githubusercontent.com/LovedGM/Task/main/YT-AD.js#policy=你的策略组名, tag= YouTube 广告检测定时切换, img-url= https://github.com/LikeGEM/TuBiao/raw/main/Icons/YouTube.png, enabled=true

基于@XIAO_KOP大佬的Google送中检测脚本修改。
1:修改了判断逻辑，检测切换送中的节点。
2:修改了文字显示内容。

**/

//var policy = $environment.params
var cronsign = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? "Y" : "N"
var policy = $environment.executeType == 0 || $environment.executeType == "0" || $environment.executeType == "-1"? GetPolicy($environment.sourcePath) : $environment.params
console.log(JSON.stringify($environment))
console.log("策略组："+policy)

function GetPolicy(cnt) {
    if (cnt && cnt.indexOf("#policy=") !=-1) {
        return decodeURIComponent(cnt.split("#policy=")[1].trim())
    }else {
        return ""
    }
}

const message = {
    action: "get_customized_policy",
    content: policy

};

var output=[]
var OKList=["不支持去广告节点 ➟ "]
var NoList=["支持去广告节点 ➟ "]
var ErrorList=["检测出错节点 ➟ "]
var pflag=1 //是否是策略，或者简单节点

$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
        console.log(resolve.error);
        $done()
    }
    if (resolve.ret) {
        //$notify(JSON.stringify(resolve.ret))
        output=JSON.stringify(resolve.ret[message.content])? JSON.parse(JSON.stringify(resolve.ret[message.content]["candidates"])) : [$environment.params]
        pflag = JSON.stringify(resolve.ret[message.content])? pflag:0
        console.log("YouTube 广告检测")
        console.log("节点or策略组："+pflag)

        //$notify(typeof(output),output)
        Check()
        //$done({"title":"策略内容","message":output})
    }
    //$done();|
}, reject => {
    // Normally will never happen.
    $done();
});

function Len(cnt) {
    return cnt.length-1
}

function Check() {
    var relay = 2000;
    for ( var i=0;i < output.length;i++) {
        testGoogle(output[i])
    }
    if (output.length<=5) {
        relay = 2000
    } else if (output.length<10) {
        relay =4000
    } else if (output.length<15) {
        relay =6000
    } else if (output.length<20) {
        relay =8000
    } else {
        relay =10000
    }
    console.log(output.length+":"+relay)
    setTimeout(() => {
        console.log(OKList)
        console.log(NoList)
        console.log(ErrorList)
        const dict = { [policy] : NoList[1]};
        if(NoList[1]) {
            console.log("选定支持去广告节点："+NoList[1])
        }
        const mes1 = {
            action: "set_policy_state",
            content: dict
        }; 
        $configuration.sendMessage(mes1).then(resolve => {
            if (resolve.error) {
                console.log(resolve.error);
                content =pflag==0 && NoList[1]? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b> 🎉 该节点支持去广告 </b><br><br>👇<br><br><font color=#54B6FF>-------------------------<br><b>⟦ `+$environment.params+` ⟧ </b><br>-------------------------</font>` : `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>😭 该节点<font color=#FF0000>不支持</font>去广告 </b><br><br>👇<br><br><font color=#54B6FF>-------------------------<br><b>⟦ `+$environment.params+` ⟧ </b><br>-------------------------</font>`
                content = pflag!=0 && !NoList[1]? `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br>❌  <b>⟦ "+$environment.params+ " ⟧ </b>⚠️ <font color=#FF0000>切换失败</font><br><br><b>该策略组内未找到支持去广告</b>的节点" + "<br><br><font color=#54B6FF>-----------------------------<br><b>检测详情请查看JS脚本记录</b><br>-----------------------------</font>"+`</p>` : content
                $done({"title":"YouTube 广告检测", "htmlMessage": content})
            }
            if (resolve.ret) {
                console.log("已经切换至支持去广告的路线 ➟ "+NoList[1])
                if (cronsign == "Y") { $notify("YouTube AD定时检测&切换", "🎉 已经切换至支持去广告的最优延迟线路👇", +NoList[1])}
                content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "<br><b>⟦ "+$environment.params+ " ⟧ </b>已切换至支持<b>去广告</b>的路线<br><br> 👇<br><br> ⟦ "+NoList[1]+ " ⟧" + "<br><br><font color=#54B6FF>-----------------------------<br><b>检测详情请查看JS脚本记录</b><br>-----------------------------</font>"+`</p>`
                $done({"title":"YouTube 广告检测", "htmlMessage": content })
            }
    }, reject => {
            $done();
        });
        
    }
    //$done();
}, reject => {
    // Normally will never happen.
    $done();
});
}

function testGoogle(pname) {
    return new Promise((resolve, reject) => {
        const url = `https://www.google.com/maps/timeline`;
        let opts = { policy : pname }
        const method = `GET`;
        const headers = {
            'Accept-Encoding' : `gzip, deflate, br`,
            'Connection' : `keep-alive`,
            'Accept' : `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
            'Host' : `www.google.com`,
            'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1`,
            'Accept-Language' : `zh-CN,zh-Hans;q=0.9`
        };
        const body = ``;
        const myRequest = {
            url: url,
            method: method,
            headers: headers,
            body: body,
            opts: opts,
            timeout: 3000
        };
        
        $task.fetch(myRequest).then(response => {
            let sCode = response.statusCode
            hmessage = "该节点不支持去广告"
            //console.log(pname+sCode);
            if (sCode == 400) {
                NoList.push(pname)
                console.log(pname + ": 该节点支持去广告")
                resolve("YES")
                return
            } else {
                OKList.push(pname)
                console.log(pname + ": 该节点不支持去广告")
                resolve("No")
                return
            }
        }, reason => {
            ErrorList.push(pname)
            console.log(pname + ": 该节点检测失败")
            reject("Error")
            return
        });
        })
    }