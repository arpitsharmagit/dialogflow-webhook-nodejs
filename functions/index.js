"use strict";

const functions = require("firebase-functions");
const { init } = require("./preparedb");
const alasql = require("alasql");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");

init();
//username ,region ,client ,project ,type ,startdate ,
//golive ,tl ,developer ,qa ,pm ,ontract ,issues
process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log("body: " + JSON.stringify(request.body));

    function welcome(agent) {
      console.log("welcome");
      agent.add(`Welcome to Anderson Bot!`);
      agent.add(`What should I call you?`);
    }

    function fallback(agent) {
      console.log("fallback");
      agent.add(`I didn't understand`);
      agent.add(`I didn't get that. Can you say it again?`);
    }

    function getusername(agent) {
      console.log("getusername");
      //check if user ing db
      let users = alasql(
        `select * from users where username like '%${
          agent.parameters.username
        }%'`
      );
      let user = users.shift();
      console.log("user: ", JSON.stringify(user));
      if (!user) {
        agent.add(`Sorry! you are not authorised`);
        agent.add(`Please try with different username.`);
        return;
      }

      var welcometest = `Welcome ${user.username}!`;
      agent.setContext({
        name: "user",
        lifespan: 100,
        parameters: { user: user }
      });
      agent.add(welcometest);
    }
    //How many projects in NA region?
    function getProjects(agent) {
      //Kate, there are 7 projects. 4 L2, 2 L3 and 1 L4.
      console.log("getProjects");
      const userContext = agent.getContext("user");
      const regionContext = agent.getContext("currentregion");
      if (!userContext) {
        agent.add(`Sorry, I didn't recognise recognise you.`);
        agent.add(`What is your name?`);
        return;
      }

      console.log('parameter',agent.parameters.region);
      // console.log('context',regionContext.parameters.currentregion);
      let user = userContext.parameters.user;
      let region = agent.parameters.region || regionContext.parameters.currentregion;
      console.log(region);
      let projects = alasql(
        `select type,count(project) as typeCount from projects where region = '${region}' and 
        empid = ${user.empid} and role LIKE '%${user.role}%' GROUP BY type`
      );
      console.log(projects);
      let items = "",
        total = 0,
        resp = "";
      if (projects[0].typeCount == 0) {
        let allowedRegions = alasql(
          `select distinct region from projects where empid = ${
            user.empid
          } and role LIKE '%${user.role}%'`
        );
        let regionText = "";
        allowedRegions.forEach(function(element) {
          regionText += element.region + ", ";
          agent.setContext({
            name: "currentregion",
            lifespan: 5,
            parameters: { currentregion: element.region }
          });
          console.log(element.region);
        });
        resp = `Sorry ${
          user.username
        }, You can get report for ${regionText}. Can I share ${regionText} data?`;
      } else {
        projects.forEach(function(element, index, data) {
          if (index == data.length - 2) {
            items += `${element.typeCount} ${element.type} and `;
            total += element.typeCount;
          } else if (index == data.length - 1) {
            items += `${element.typeCount} ${element.type}`;
            total += element.typeCount;
          } else {
            items += `${element.typeCount} ${element.type}, `;
            total += element.typeCount;
          }
        });
        resp = `${user.username}, there are ${total} projects. ${items}`;
      }

      agent.add(resp);
    }
    //How many projects in total?
    function getTotalProjects(agent) {
      console.log("getTotalProjects");

      //Kate, there are 12 projects. 7 NA, 3 EMEA and 1 APAC.
      const userContext = agent.getContext("user");
      if (!userContext) {
        agent.add(`Sorry, I didn't recognise recognise you.`);
        agent.add(`What is your name?`);
        return;
      }

      let user = userContext.parameters.user;
      let projects = alasql(
        `select region,count(project) as projectCount from projects where empid = ${
          user.empid
        }
          and role LIKE '%${user.role}%' GROUP BY region`
      );
      console.log(projects);

      let items = "",
        total = 0;
      projects.forEach(function(element, index, data) {
        if (index == data.length - 2) {
          items += `${element.projectCount} ${element.region} and `;
          total += element.projectCount;
        } else if (index == data.length - 1) {
          items += `${element.projectCount} ${element.region}`;
          total += element.projectCount;
        } else {
          items += `${element.projectCount} ${element.region}, `;
          total += element.projectCount;
        }
      });
      let resp = `${user.username}, there are ${total} projects. ${items}.`;
      console.log(resp);
      agent.add(resp);
    }
    //Any high impact issues?
    function getImpactProjects(agent) {
      console.log("getImpactProjects");
      //Kate, Project OC03 has issues and may get delayed.
      const userContext = agent.getContext("user");
      if (!userContext) {
        agent.add(`Sorry, I didn't recognise recognise you.`);
        agent.add(`What is your name?`);
        return;
      }

      let user = userContext.parameters.user;

      let projects = alasql(
        `select project from projects where empid = ${
          user.empid
        } and role LIKE '%${user.role}%' and ontract='no'`
      );
      let resp = "";
      if (projects.length == 0) {
        resp = `${user.username}, There is any project with no issues.`;
      } else {
        let issue = projects.shift();
        agent.setContext({
          name: "issueproject",
          lifespan: 5,
          parameters: { issueproject: issue.project }
        });
        let items = `Project ${issue.project}`;
        resp = `${user.username}, ${items} has issues and may get delayed.`;
      }

      agent.add(resp);
    }
    //Who owns this?
    function getProjectOwner(agent) {
      console.log("getProjectOwner");
      //Kate, PM  XXX, TL XXX, Developer XXX and QA XXXX
      const userContext = agent.getContext("user");
      if (!userContext) {
        agent.add(`Sorry, I didn't recognise recognise you.`);
        agent.add(`What is your name?`);
        return;
      }
      let user = userContext.parameters.user;
      const projectContext = agent.getContext("issueproject");
      let issueproject;
      if (!projectContext) {
        let projects = alasql(
          `select project from projects where empid = ${
            user.empid
          } and role LIKE '%${user.role}%' and ontract='no'`
        );
        issueproject = projects.shift();
      } else {
        issueproject = projectContext.parameters.issueproject;
      }
      console.log("Issue project", issueproject);

      //SQl
      let projectDetails = alasql(
        `select pm,tl,developer,qa from projects where project = '${issueproject}'`
      );
      projectDetails = projectDetails.shift();
      console.log(projectDetails);
      let finalresp = `${user.username}, PM ${projectDetails.pm}, TL ${
        projectDetails.tl
      }, Developer ${projectDetails.developer} and QA ${projectDetails.qa}.`;
      console.log(finalresp);
      agent.add(finalresp);
    }

    //May I know utilization for EMEA team?
    function getUtilization(agent){
      //Varun, 9 members are at 100% whereas 2 members have 12% available bandwidth
      console.log("getUtilization");
      const userContext = agent.getContext("user");      
      if (!userContext) {
        agent.add(`Sorry, I didn't recognise recognise you.`);
        agent.add(`What is your name?`);
        return;
      }
      let user = userContext.parameters.user;
      let region = agent.parameters.region;
      agent.setContext({
        name: "currentregion",
        lifespan: 5,
        parameters: { currentregion: region }
      });
      let utilization100query = alasql(
        `select count(*) as memberCount from usage where region = '${region}' 
        and utilizationtoday=100`
      );
      
      let utilizationnot100query = alasql(
        `select count(*) as memberCount, utilizationtoday from usage where region = 'EMEA' 
        and utilizationtoday<>100 group by utilizationtoday`
      );
      console.log(utilizationnot100query);
      let utilizationnot100 ="",resp="";
      let utilization100 = utilization100query.shift();
      if(utilization100.memberCount == 0){
        resp = `Sorry ${user.username}, I didn't find any result for ${region}.`;
        agent.add(resp);
        return;
      }
      utilizationnot100query.forEach(function(elem){
        let remaining = 100 - elem.utilizationtoday;
        console.log(remaining);
        utilizationnot100+=`${elem.memberCount} members have ${remaining}%`
      });

       resp = `${user.username}, ${utilization100.memberCount} members are at 100% whereas ${utilizationnot100} available bandwidth.`;
      console.log(resp);
      agent.add(resp);
    }
    //Can anyone support one urgent project on weekend?
    function getSupport(agent){
      //Varun, 2 members named XXX and XXX are available this weekend.
      console.log("getSupport");
      const userContext = agent.getContext("user");      
      const regionContext = agent.getContext("currentregion");
      if (!userContext) {
        agent.add(`Sorry, I didn't recognise recognise you.`);
        agent.add(`What is your name?`);
        return;
      }
      let user = userContext.parameters.user;
      let region = regionContext.parameters.currentregion;
      console.log(region);
      let weekendemps = alasql(
        `select employename from usage where 
        region = '${region}' 
        and weekendavailable='yes'`
      );   
      console.log(weekendemps);  
      let emptext = "",count=0;
      weekendemps.forEach(function(elem){
        emptext+=`${elem.employename}, `
      });

      let resp = `${user.username}, ${weekendemps.length} members named ${emptext} are available this weekend.`;
      console.log(resp);
      agent.add(resp);
    }
    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", fallback);
    intentMap.set("Get User Name", getusername);
    intentMap.set("Get Projects", getProjects);
    intentMap.set("Get Total Projects", getTotalProjects);
    intentMap.set("Impact Projects", getImpactProjects);
    intentMap.set("Project Owner", getProjectOwner);
    intentMap.set("Get Utilization",getUtilization);
    intentMap.set("Get Support Employee",getSupport);

    agent.handleRequest(intentMap);
  }
);
