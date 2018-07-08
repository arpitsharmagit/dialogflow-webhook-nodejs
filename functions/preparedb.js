const alasql =require('alasql');

function init(){
    //create tables
    alasql(`CREATE TABLE users (empid int,username string,role string)`);
    alasql(`CREATE TABLE projects (empid int,region string,client string,project string,type string,startdate string,
        golive string,tl string,developer string,qa string,pm string,ontract string,issues string,role string)`);
    alasql(`CREATE TABLE usage (region string,shiftmgr string,tl string,empid string, employename string,
        utilizationtoday int,utilizationtomorrow int,utilizationdayafter int,weekendavailable string)`);

    alasql(`INSERT INTO users VALUES
    (1,'Kate Svoboda','VP'),
    (2,'Varun Sharma','director')`)

        //insert values
    alasql(`INSERT INTO projects VALUES 
    (1,'NA','Amazon','AM01','L1','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'NA','Amazon','AM01','L2','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'NA','Amazon','AM01','L3','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'NA','Dell','DE02','L3','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'NA','Dell','DE02','L2','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'NA','OCCM','OC03','L4','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'NA','OCCM','OC03','L2','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'EMEA','Dell','DE02','L2','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'EMEA','OCCM','OC03','L4','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'EMEA','OCCM','OC03','L2','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','yes','NA','VP'),
    (1,'APAC','Amazon','AM01','L2','20-2-2018','20-8-2018','abhishek','aman','neeraj','vijay','no','NA','VP'),
    (2,'EMEA','Dell','DE02','L2','20-2-2018','20-8-2018','raj','kartik','neeraj','raman','yes','NA','VP,director'),
    (2,'EMEA','OCCM','OC03','L4','20-2-2018','20-8-2018','raj','kartik','neeraj','raman','no','NA','VP,director'),
    (2,'EMEA','OCCM','OC03','L3','20-2-2018','20-8-2018','raj','kartik','neeraj','raman','yes','NA','VP,director')`)   
    
    alasql(`INSERT INTO usage VALUES     
    ('EMEA','Vijay','Abhishek','01','aman',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','02','ginny',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','03','sahu',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','04','richa',88,88,88,'yes'),
    ('EMEA','Vijay','Abhishek','05','prakash',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','06','neelofer',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','07','shahil',88,88,88,'yes'),
    ('EMEA','Vijay','Abhishek','08','varun',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','09','kartik',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','10','arpit',100,100,100,'No'),
    ('EMEA','Vijay','Abhishek','11','raj',100,100,100,'No')`)

    // var projects = alasql("SELECT * FROM projects");    
    var users = alasql("SELECT * FROM users");    
    var usage = alasql("SELECT * FROM usage");  
    let user =   { empid :1, role:'VP'};
    let projects = alasql(
        `select employename from usage where region = 'EMEA' 
        and weekendavailable='yes'`
      );
    console.log(projects);
   
    // let utilization = alasql(
    //     `select count(*) as memberCount, utilizationtoday from usage where region = 'EMEA' 
    //     and utilizationtoday<>100 group by utilizationtoday`
    //   );
    // console.log(utilization);
}
// init();

exports.init = init;