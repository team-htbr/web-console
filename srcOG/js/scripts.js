(function() {

    'use strict';

    const serverKey = 'key=AAAAJrMVIEw:APA91bEmBIZ3u8kEiKSAh6QOsnpvux9tYPobyRKILZwDT3B4q3eaOOa4Y_zD6kWbAQRojgySBT3j_5Vu9XCn7drTlSClYOGyXrnqtTc3qVG3lAQJzSLpspsw-eccBEvqP8pUsWaPog7d';
    // HOW TO GET phoneKey
    // 1. Connect device with Android Studio
    // 2. Run app on device
    // 3. Toggle 'Android monitoring at the bottom of Android Studio and press the 'SHOW TOKEN' button
    // 4. Copy string after 'Token: ' 
    // 5. Paste token in constant 'phoneKey'
    const msgTopic = { "notification": { "title": "Rode Kruis", "body": "Notification for devices subscribed to a topic" }, "to" : "/topics/blood-AB" };

    var sendNotification = function(msg) {
        $.ajax({
            headers: { 'Authorization': serverKey },
            type: 'POST',
            url : 'https://fcm.googleapis.com/fcm/send',
            contentType : 'application/json',
            data : JSON.stringify(msg),
            dataType : 'json',
            succes : function(data) {
                console.log(data);
            }
        })
    };

    // $(document).ready(function() {
    //     $('#btnSpecific').on('click', function() {
    //         sendNotification(msgSpecific)
    //     });
    // });

    $(document).ready(function() {
        $('#btnTopic').on('click', function() {
            sendNotification(msgTopic)
        });
    });

})();