// Include Telegraf module
const Telegraf = require('telegraf');

// Create a bot using TOKEN provided as environment variable
const bot = new Telegraf("2138070919:AAHLhcGWqOwtmlGEIRxmP7UQJGxpxEZz-68");

const mysql = require('mysql');

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cek-hafalan"
})

function dbcon(){
    conn.query("SELECT *  FROM hafalans where id = (select max(id) from hafalans as f where f.username_user = hafalans.username_user)",     
    function (err, result, fields) {
    if(err){
        throw err;
    }
    
    dataStore = [];
    // console.log(result);
    result.forEach(item => {
        // console.log(item.user_id);
        dataStore.push({
            username_user: item.username_user,
            mulai: item.mulai,
            akhir: item.akhir
        })
    })
 })
}

conn.connect(function(err){
    if(err){
        throw err;
    }
    console.log("connected !");
   dbcon();
})


const helpMessage = `
    Untuk menggunakan bot ini ada beberapa perintah:
    /listhafalan - untuk melihat list hafalan santri
    /hafalan <nis_santri> - untuk melihat setoran terakhir santri berdasarkan NIS Santri
    /tambahhafalan <nis_santri><mulai><akhir> - untuk menambahkan setoran terbaru santri berdasarkan NIS Santri
    /hapushafalan <nis_santri> -  untuk menghapus setoran terbaru santri berdasarkan NIS Santri
`;

bot.help(ctx => {
    ctx.reply(helpMessage);
});

bot.command('listhafalan', ctx => {
    let listhafalanMessage = `List Hafalan : \n`;

    dataStore.forEach(item => {
        listhafalanMessage += `${item.username_user}: ${item.mulai} sampai dengan ${item.akhir}\n`;
    })

    ctx.reply(listhafalanMessage);
    dbcon();

    return;
})


bot.command('hafalan', ctx => {
    let input = ctx.message.text.split(" ");
    if(input.length != 2){
        ctx.reply("Anda harus mengisi NIS Santri pada argumen ke 2");
        return;
    }
    // console.log(input[1]);
    let hafalanInput = input[1];
    dataStore.forEach(item => {
        if(item.nis.includes(hafalanInput)){
            let nis = item.nis
            let mulai = item.mulai
            let akhir = item.akhir
            ctx.reply(" Setoran Terakhir nis("+nis + "): "+ mulai + " sampai dengan " + akhir);
            dbcon();
            return;
        }
    })
})

bot.command('tambahhafalan', ctx => {
    let input = ctx.message.text.split(" ");
    if(input.length != 4){
        ctx.reply("Anda harus mengisi NIS Santri, setoran awal dan akhir pada argumen ke 2, 3 dan 4");
        return;
    }
    // console.log(input[1]);
    // console.log(input[2]);
    // console.log(input[3]);
    let username_user = input [1];
    let mulai = input [2];
    let akhir = input [3];
    var sql = `insert into hafalans (username_user,mulai,akhir) value ('${username_user}', '${mulai}', '${akhir}')`;
    conn.query(sql, function(err, result){
        if(err){
            throw err;
        };
        // console.log('hafalan baru berhasil ditambahkan');
        ctx.reply("hafalan baru berhasil ditambahkan. Kode transaksi: ");
        dbcon();
    })
})

bot.command('hapushafalan', ctx => {
    let input = ctx.message.text.split(" ");
    if(input.length != 2){
        ctx.reply("Anda harus mengisi NIS Santri pada argumen ke 2");
        return;
    }
    // console.log(input[1]);
    // console.log(input[2]);
    // console.log(input[3]);
    let id = input [1];
    var sql = `DELETE FROM hafalans WHERE id = ('${id}') `;
    conn.query(sql, function(err, result){
        if(err){
            throw err;
        };
        // console.log('hafalan baru berhasil ditambahkan');
        ctx.reply('hafalan terakhir berhasil dihapus');
        dbcon();

    })
})

bot.launch();
