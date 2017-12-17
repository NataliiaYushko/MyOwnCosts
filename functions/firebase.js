// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: "myowncosts-2ad50",
        clientEmail: "firebase-adminsdk-8siff@myowncosts-2ad50.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC18aToF4DUNcgx\nNLxF5bdLCDTBNabZguvDXi8HHa/EjWfEjDqA0yUC+L0pJONSbAtmvtAoELHIyuAM\nFutDNhxzyf2eMdjlWE6OzFo50axk/w8qXTJKevj7Xyls2GXVIn+UmUU99sWZEO10\ndjmgsElkA5mN14Q6SVsriJqCtyt0KOdEvPJH7fC+49qCKQ5EBp7wU9tRxysgZciE\nMIXVEfmeGiOhIfnFXlfTcdsCRUqpn71xE/zMrWAu2xqJBlpJ9BqxeC+3Sc+8lecC\nLj45KdlSaEgVyQAdzOBxNG5nT6ip8oAodbaiVA2twbv+emSy3Ky/XloX8EhMYEGr\n/WLaba81AgMBAAECggEAQKerW1Km1EJ8bof387rLJN24qYQgU6FDmLyKZ7Pz9xvs\n6RqP26GswF6WEd3q7io47v0VyXcNRnZZodIvLkY3XCpGdwXttqpn2DTkRzGsWoOM\n5xgRPAhxHBrYBLbtkQzeW3cP9RIRa/BpAX7VwbWDjwf8dDxG39Obk1/K0HK4/WDF\n3d1k0wBE9PJmq29v76oI4sT0s62bTzDPPprqpK7cp3pS89Ips8gddVtV+q/BV02V\nXkxVxU+OoKzEmWBSlJALJjNgRPkvZhV6npboohLHUD7Q/Q1W9ZbgRQknZmXA6csP\nEze8SRnhwFqIF/tUPUQEgwvAvpNGKSVJHgPLJvVsbQKBgQDpKEZa9+Sqg2Kh0/gt\nEpO3a6GHv8O1Vlo7LIOU9tGsg0fUG+8jU45n5a9eqGVYi8afhqDBkvMrX0pfC758\nFTVCG5WFwjMxeVVx1pmqzZ2bAQIRQpVb0e5hg0BJykIYtpZ6P7k2pGXyMNJ8RUPA\n4TuKedsE6qaAm28GyDevSiyE5wKBgQDHxOgXEmxcCe++Cn4CNoRBU+R33CoN5GGj\nno1eRKDG6vjjkC27Qt24DLSQ1ysIsbTg+cmkI9lb866Hj2LMtSD9E8kc0r5NR4Sl\ncp4uQg7tQqg7PtAYYxCRPmE52DZAn8NioFIwEY9/hsfTWDk+H1eephxN12exaogY\nvorTItpLgwKBgDCUYqxbkDpy658aQlBp2XtTIrHdI9Lprh08NiJYlvFh3Rp1w4rR\nww8kzThkz9D2NqlQbLhIfQAhd6Z8FPFXneQrSSk4gGAjjskMVLJA60C7ogmknOgn\nwopwxXlaehEaIhpQoq+e61reD00zRV2v0C8XGqpYld6gBC8eknOkecgrAoGAbyMQ\nq6VIO3wbsHJN4BVMRrvRYw1NKCViXJCcvVEY0RFwHcncZ02v4/DNk7bg7hlPM8pD\nb9mx1wIemrQelxw9mg4j2LE1xfB/zzuQ3NNLUpu+1BcB1k9mrCc0F+Y9aH55SKlA\nkBV069Gj4eQ3FGSDbnOjU3r+6SkHRhzbRtMg9tkCgYBpRacp81KW8qIzG/k8Pppo\nwTl/hmc1FTzzDqMQOFqxmVjVhus9k04D3ppkgLC9oI+16g7KWedE/2dnYX2JpFqi\ne2AzVVEBq8vtfyH9T4kSVO8dLFkjmDCj7GCf4l/5Hdr4AY9fC1WTo/0gqILDIGRP\nE6pujA/TkpP5CJ45bdpzJA==\n-----END PRIVATE KEY-----\n"
    }),
    databaseURL: "https://myowncosts-2ad50.firebaseio.com"
});
var firebase = admin;
class FireBaseModule {
    static selectDataByField(data_path, getFrom, field, fieldValue) {
        return new Promise((resolve) => {
            let fbRef = firebase.database().ref();
            fbRef.child(data_path).orderByChild(field).equalTo(fieldValue).limitToFirst(1).once(getFrom, (snapshot) => {
                let val = snapshot.val();
                resolve(val);
            });
        });
    }
    static selectDataByKey(data_path, getFrom, fieldValue) {
        return new Promise((resolve) => {
            let fbRef = firebase.database().ref();
            fbRef.child(data_path).child(fieldValue).once(getFrom, (snapshot) => {
                let val = snapshot.val();
                resolve(val);
            });
        });
    }
    static insertData(file_path, data, key) {
        return new Promise((resolve, reject) => {
            if (key == null) {
                key = firebase.database().ref().child('file_path').push().key;
            }
            let updates = {};
            updates['/' + file_path + '/' + key] = data;
            firebase.database().ref().update(updates).then(() => {
                resolve(key);
            });
        });
    }
    static checkDataByField(data_path, getFrom, field, fieldValue) {
        return new Promise((resolve) => {
            let fbRef = firebase.database().ref(data_path);
            fbRef.orderByChild(field).equalTo(fieldValue).limitToFirst(1).once(getFrom, (snapshot) => {
                if (snapshot.hasChildren()) {
                    resolve(snapshot.key);
                } else {
                    resolve(null);
                }
            });
        });
    }
    static writeUserData(userId, user) {
        let userRef = firebase.database().ref('/users/' + userId);
        userRef.once("value", function (snapshot) {
            if (!snapshot.hasChildren()) {
                firebase.database().ref('users/' + user.id).set(user);
            }
        });
    }


    static writeCostData(userId, category, date, parameters) {
        let userRefCosts = firebase.database().ref('/users/' + userId + '/costs');
        userRefCosts.push();
        userRefCosts.push({
            value: cost,
            date: parameters.date != null ? parameters.date.toDateString() : date.toDateString(),
            sys_date : parameters.date != null ? parameters.date.getTime() : date.getTime(),
            location: parameters.location != null ? parameters.location : 'null',
            category: category
        });
    }

    static GetCostsStatistics(userId, startDate, category) {
        return new Promise((resolve) => {
            let costsRef = firebase.database().ref('/users/' + userId + '/costs');
            var dictionary = {};
            costsRef.orderByChild("sys_date").startAt(startDate.getTime()).once("value").then(function (snapshot) {
                snapshot.forEach(function (data) {
                    dictionary[data.val().category] = 0;
                });
                snapshot.forEach(function (data) {
                    dictionary[data.val().category] = dictionary[data.val().category] + Number(data.val().value);
                });
                resolve(dictionary);
            });
        });
    }
    static GetCostsStatisticsLocation(userId, startDate) {
        return new Promise((resolve) => {
            let costsRef = firebase.database().ref('/users/' + userId + '/costs');
            var dictionary = {};
            costsRef.orderByChild("sys_date").startAt(startDate.getTime()).once("value").then(function (snapshot) {
                snapshot.forEach(function (data) {
                    dictionary[data.val().location] = 0;
                });
                snapshot.forEach(function (data) {
                    dictionary[data.val().location] = dictionary[data.val().location] + Number(data.val().value);
                });
                resolve(dictionary);
            });
        });
    }
    static UpdateSubscription(userId, value) {
        let updates = {};
        updates['/users/' + userId + '/' + 'subscription'] = value;
        firebase.database().ref().update(updates).then(() => {
            resolve(key);
        });
    }




}
exports.default = FireBaseModule;