const request = require('request');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const progressStream = require('progress-stream');
const inquirer = require('inquirer');

const fs = require('fs')

const questions = ['下载最新/start?', '清除缓存/clear?','退出/quit?'];

const url = 'http://leagueskin.net/p/download-mod-skin-2020-chn';

//是否下载
function setOutput(title) {
    inquirer.prompt({
        name: "choose",
        type: "list",
        message: title,
        choices: questions,
        default: "exit",
    }).then(async (res) => {
        const { choose } = res;
        switch (choose) {
            case '下载最新/start?':
             const res =  await getRef();
             await fsDem(res);
                break;
            case '清除缓存/clear?':
              await rmDir('C:/Fraps/');
              console.log('清除成功');
              await  sleep();
              break;
            case '退出/quit?':
                await sleep();
                break;
        }
    })
}

//清除缓存文件
function rmDir( path ) {
    new Promise(async ( resolve ) => {
        if (fs.existsSync(path)) {
            const dirs = [];
            const files = await fs.readdirSync(path);
            files.forEach(async ( file ) => {
                const childPath = path + "/" + file;
                if (fs.statSync(childPath).isDirectory()) {
                    await rmDir(childPath);
                    dirs.push(childPath);
                } else {
                    await fs.unlinkSync(childPath);
                }
            });
            dirs.forEach(( fir ) => fs.rmdirSync(fir));
            resolve();
        }
    });
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
        }).on('finish', async function () {
            console.log('文件下载完成');
           await sleep()
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
//初始化的版本号
let version = '0.0'
try {
    fs.readdir('C:\\Fraps\\', async (err, req) => {
        await getRef().then(async (res) => {
            let newArr = res.split('/')[3].split('.').slice(0, -1);
            newArr[0] = newArr[0].split('_')[1];
            let newVi = JSON.stringify(newArr.join('.'));
            if (req == null ||  req.length<=1) version = '0.0';
            else version = JSON.stringify(req[1].split(' ')[1].split('.').slice(0, -1).join('.'));
            setOutput(`检查更新：当前版本${ version },现在版本${ newVi }`)

        })


    })
} catch (e) {
    console.log(e)
}

//退出
async function sleep(ms= 1000,num= 5) {
    if(num == 5)  console.log('5秒后自动退出');
    if(num > 0){
        await setTimeout(async function () {
            await console.log(num);
            num--;
            await sleep(ms,num);
        }, ms)
    }
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




