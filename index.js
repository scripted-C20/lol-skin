const request = require('request');
const cheerio = require('cheerio');
const readline = require('readline');
const fetch = require('node-fetch');
const progressStream = require('progress-stream')

const fs = require('fs')

let r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const url = 'http://leagueskin.net/p/download-mod-skin-2020-chn';

//是否下载
function setOutput() {
    //调用接口方法
    r1.question("是否下载?Y/N\t", async function (answer) {
        if (answer === 'Y' || answer === 'yes' || answer === 'y') {
            console.log("执行了")
            await getRef().then(async (res) => {
                await fsDem(res);

            })
        }

        // 不加close，则不会结束
        r1.close();
    })

//close事件监听
    r1.on("close", function () {
        // 结束程序
        process.exit(0);
    })
}

//下载
async function fsDem(url) {
    console.log(url)
    await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/octet-stream'},
    }).then(async res => {

        const fileStream = fs.createWriteStream(url.substring(url.lastIndexOf('/') + 1)
        ).on('error', function (e) {
            console.error('错误', e)
        }).on('ready', function () {
            console.log("开始下载:");
        }).on('finish', function () {
            console.log('文件下载完成:');
        });

        let length = res.headers.get("content-length");
        let str = progressStream({
            length, time: 100
        });

        let prog = 0;

        str.on('progress', function (progressData) {
            prog = progressData.percentage >> 0;
            console.log(prog + '%');
        });

        res.body.pipe(str).pipe(fileStream);

        while (prog < 100) {
            await new Promise(resolve => setTimeout(() => resolve(), 200));
        }
    });
}

//获取下载连接
function getRef() {
    return new Promise((resolve, reject) => {
        request(url, {}, (err, req) => {
            const $ = cheerio.load(req.body)
            // //下载文件的链接 $('#link_download3')[0].attribs['href']
            resolve($('#link_download3')[0].attribs['href']);
            reject(err);
        })
    })

}

let version = '0.0'

try {
    fs.readdir('C:\\Fraps\\', async (err, req) => {
        await getRef().then(res => {
            let newArr = res.split('/')[3].split('.').slice(0, -1);
            newArr[0] = newArr[0].split('_')[1];
            let newVi = JSON.stringify(newArr.join('.'));
            if (req == null) version = '0.0'
            else version = JSON.stringify(req[1].split(' ')[1].split('.').slice(0, -1).join('.'))

            if (compareVersion(version, newVi) === -1) {
                console.log(`检查更新：当前版本${version},现在版本${newVi}`)
                setOutput()
            } else if (compareVersion(version, newVi) === 0) {
                console.log(`检查更新：当前版本${version},现在版本${newVi},当前最新版本`);
                return process.exit(0)
            }
        })


    })
} catch (e) {
    console.log(e)
}

//比较版本号
function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    // 调整两个版本号位数相同
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    // 循环判断每位数的大小
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}




