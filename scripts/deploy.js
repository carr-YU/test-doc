const shelljs = require('shelljs');
const Rsync = require('rsync');
const path = require('path');
const colors = require('colors');
const argv = require('yargs').argv;
const nodemailer = require('nodemailer');

if(!argv.target){
  shelljs.echo(colors.red('--target 目标主机{calman_cloud}'));
  shelljs.exit(1);
}
const targetName = argv.target;

const host_map = {
  calman_cloud: 'root@122.51.238.220:/root/doc',
};

if (!host_map[targetName]) {
  shelljs.echo(colors.red('目标主机不存在'));
  shelljs.exit(1);
}
//设置邮箱配置
let transporter=nodemailer.createTransport({
  host:'smtp.exmail.qq.com',//邮箱服务的主机，如smtp.qq.com
  port:'465',//对应的端口号
  //开启安全连接
  secure:true,
  //secureConnection:false,
  //用户信息
  auth:{
    user:'yukaimin@jytpay.com',
    pass:'bZh8vXcrzc6METGJ'
  }
});
//设置收件人信息
let mailOptions={
  from:'yukaimin@jytpay.com',//谁发的
  to:'823125060@qq.com',//发给谁
  subject:'这是一个测试邮件',//主题是什么
  text:'hello word',//文本内容
  html:'<h1>hello word</h1>',//html模板
};


//通知，用邮箱的话可以使用nodemailer
function sendNotify(message) {
  shelljs.exec(`curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=dbb3fa53-29f8-4394-bfa1-ecce009e8cbb' -H 'Content-Type: application/json' -d '{"msgtype": "text", "text": {"content": "${message}"}}'`);
}

// 通知 开始构建

// 安装依赖
console.log(colors.yellow('<--------安装依赖-------->'));
if (shelljs.exec('npm i').code !== 0) {
  shelljs.echo('error: npm install error.');
  shelljs.exit(1);
}

// 测试
console.log(colors.yellow('<--------进行测试-------->'));
if (shelljs.exec('npm run test').code !== 0) {
  shelljs.echo('error: npm install error.');
  shelljs.exit(1);
}

// 构建
// sendNotify('开始构建');
console.log(colors.yellow('<--------开始构建-------->'));
if (shelljs.exec('npm run build').code !== 0) {
  shelljs.echo('error: npm install error.');
  shelljs.exit(1);
}

// 部署
console.log(colors.yellow('<--------开始部署-------->'));
// sendNotify('开始部署');
const rsync = Rsync.build({
  source: path.join(__dirname, '../', '.vuepress/dist/*'),
  destination: host_map[targetName],
  flags: 'avz',
  shell: 'ssh -i /Users/calman/.ssh/yukaimin_rsa',
});

// rsync.execute((err, code, cmd) => {
//   if(err == null && code == 0){
//     console.log(colors.green('<--------部署完成-------->'));
//   }else{
//     console.log(colors.red('<--------部署失败-------->'));
//     console.log(err,"[",err,"]");
//   }
//   //发送邮件
//   transporter.sendMail(mailOptions,(error,info)=>{
//     if(error){
//       return console.log(error);
//     }
//     console.log(`Message: ${info.messageId}`);
//     console.log(`sent: ${info.response}`);
//   });
//   console.log("执行脚本为：",cmd);
  
//   // sendNotify('部署完成');
// });
