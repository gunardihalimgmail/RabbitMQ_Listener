const amqplib = require('amqplib/callback_api');
const queue = 'notif';
const port = process.env.port || 3017

// for delete queue
// python.exe rabbitmqadmin delete queue name=notif

amqplib.connect('amqp://localhost:5672', (err,conn)=>{
    if (err) {
        console.log("AMQP", err.message)
        return
    }

    conn.on("error", (err)=>{
        if (err.message.toString().toLowerCase() != "connection closing"){
            console.log("[AMQP] conn error", err.message)
        }
    })

    conn.createChannel((err2, ch2) => {
        if (err2){
            console.log("AMQP CREATE CHANNEL : ",err2.message)
            return
        }
        
        // check jika queue tidak ada maka ok3 = 'undefined'
        // ch2.checkQueue(queue, (err3, ok3)=>{
        //     console.log(ok3)
        //     if (typeof ok3 == 'undefined'){
        //         return
        //     }

        // })
        
        // how many message can process the consumer.

        ch2.prefetch(process.env.CLOUDAMQP_CONSUMER_PREFETCH ? process.env.CLOUDAMQP_CONSUMER_PREFETCH : 10)

        ch2.consume(queue, (msg)=>{
            try{
                if (msg?.['content'].toString()){
                    console.log(JSON.parse(msg.content.toString()));
                    ch2.ack(msg);
                }
                else{
                    console.log("Reject");
                    ch2.reject(msg, true)
                }

            }catch(e){
                console.log("ERROR")
                
                if (!e) return false;
                console.error("[AMQP] ERROR",e);
                conn.close();
                return true;
            }
        })


        // try{
        //     ch2.checkQueue(queue, (err3, ok)=>{
        //         console.log(err3)
        //     })
        // }
        // catch(ercatch){
        //     console.log(ercatch)
        // }
        // ch2.consume(queue, (err2, msg)=>{
        //     console.log(msg?.content?.toString())
        // })

        // ch2.deleteQueue(queue)
        // ch2.sendToQueue(queue, Buffer.from('Testing Hello World'))
    })
    console.log('success')
})