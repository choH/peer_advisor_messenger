// https://github.com/AlexWang-16/react-lex-plus/blob/master/src/styles/chatbot.css
import React, { Component } from "react";
import PropTypes from "prop-types";
import merge from "lodash/merge";
import AWS from "aws-sdk";
import axios from "axios";
import "./chatbot_component.css";

class MyLexChat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: "",
      lexUserId: "chatbot" + Date.now(),
      sessionAttributes: this.props.sessionAttributes,
      visible: "open",
    };
    this.conversationDivRef = React.createRef();
    this.greetingMsgRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  //show means it displays the quick question text
  buttonMessage(show,message,displayText){
    console.log("in quick question");
    let thisAlias = this.props.alias;
    let thisBotName = this.props.botName;
    let thisLexUserId = this.state.lexUserId;
    let thisSessionAttributes = this.state.sessionAttributes;
    let thisDebugMode = this.props.debugMode;
    let myThis = this;

      var inputField = message;

      // send it to the Lex runtime
      var params = {
        botAlias: thisAlias,
        botName: thisBotName,
        inputText: inputField,
        userId: thisLexUserId,
        sessionAttributes: thisSessionAttributes,
      };

      if (thisDebugMode === true) {
        console.log(JSON.stringify(params));
      }
      if(show){
        myThis.showRequest(displayText);
      }
      var a = function (err, data) {
        if (err) {
          console.log(err, err.stack);
          myThis.showError(
            "Error:  " + err.message + " (see console for details)"
          );
        }
        if (data) {

          // capture the sessionAttributes for the next cycle
          myThis.setState({ sessionAttributes: data.sessionAttributes });
          // show response and/or error/dialog status
          if(show){
            //displace message
          myThis.showResponse(data);
        }
      }
      };
      //send lex the message
      myThis.lexruntime.postText(params, a.bind(this));

      let inputFieldDOM = document.getElementById("inputField");
      inputFieldDOM.innerHTML = "";
      myThis.state.data = "";
      return true;
  }
  componentDidMount() {
    document.getElementById("inputField").focus();

    let greetingNode = document.createElement("P");
    this.greetingMsgRef.current = greetingNode;
    greetingNode.className = "lexResponse";
    greetingNode.appendChild(document.createTextNode(this.props.greeting));
    greetingNode.appendChild(document.createElement("br"));
    this.conversationDivRef.current.appendChild(greetingNode);

    let faqNodeConvoSpacer  = document.createElement("div");
    faqNodeConvoSpacer.className = "convoSpacer";
    faqNodeConvoSpacer.style.display = "flex";
    faqNodeConvoSpacer.style.justifyContent = "space-evenly";

    let quickQuestionDiv = document.createElement("div");
    quickQuestionDiv.style.width = "33%";
    let quickQuestionButton = document.createElement("button");
    quickQuestionButton.id = "quickQuestion";
    quickQuestionButton.innerHTML = "Quick Question";
    quickQuestionButton.style.fontSize = "16px";
    quickQuestionDiv.appendChild(quickQuestionButton);
    faqNodeConvoSpacer.appendChild(quickQuestionDiv);
    let objectThis = this;
    // let qqMessageDiv = document.createElement("div");
    quickQuestionButton.addEventListener("click",function(){
      objectThis.buttonMessage(true,"Quick Question","Quick Question");
    });

    let faqNode = document.createElement("ul");
    faqNode.style.display = "inline-block";
    faqNode.style.width = "33%";
    document.getElementById("conversation").style.textAlign = "center";
    this.greetingMsgRef.current = faqNode;
    faqNode.className = "lexResponse";
    faqNodeConvoSpacer.appendChild(faqNode);

    let menuDiv = document.createElement("div");
    menuDiv.style.width = "33%";
    let menuButton = document.createElement("button");
    menuButton.id = "menuButton";
    menuButton.innerHTML = "Menu";
    menuButton.style.fontSize = "16px";
    menuDiv.appendChild(menuButton);
    faqNodeConvoSpacer.appendChild(menuDiv);

    menuButton.addEventListener("click",function(){
    objectThis.buttonMessage(true,"Menu","Menu");
    });

    let title = "Frequently Asked Questions";
    let buttons = ["How can I get an internship?",
                  "What's the difference between a BS and a BA?",
                  "Which classes should I take?"];
    let responseCardDiv = document.createElement("div");
    responseCardDiv.style.textAlign = "center";
    let titleDiv = document.createElement("div");
    titleDiv.innerHTML = title;
    titleDiv.style.fontWeight = "bold";
    responseCardDiv.appendChild(titleDiv);
    for(let i = 0; i < buttons.length; i++){
      let responseButtonDiv = document.createElement("div");
      let responseButtons = document.createElement("button");
      responseButtons.innerHTML = buttons[i];
      responseButtons.value = buttons[i];
      let thisAlias = this.props.alias;
      let thisBotName = this.props.botName;
      let thisLexUserId = this.state.lexUserId;
      let thisSessionAttributes = this.state.sessionAttributes;
      let thisDebugMode = this.props.debugMode;
      let myThis = this;

      let objectThis = this;
      // let qqMessageDiv = document.createElement("div");
      responseButtons.addEventListener("click",async function(){
          await objectThis.buttonMessage(false,"Quick Question","Quick Question");
          objectThis.buttonMessage(true,responseButtons.value, responseButtons.value);
      });
      responseButtonDiv.appendChild(responseButtons);
      responseButtonDiv.style.textAlign = "center";
      responseButtons.style.fontSize = "16px";
      responseCardDiv.appendChild(responseButtonDiv);
    }
    faqNode.appendChild(responseCardDiv);
    faqNode.appendChild(document.createElement("br"));
    this.conversationDivRef.current.appendChild(faqNodeConvoSpacer);



    AWS.config.region = this.props.region || "us-east-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.props.IdentityPoolId,
    });
    var lexruntime = new AWS.LexRuntime();
    this.lexruntime = lexruntime;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.sessionAttributes &&
      this.props.sessionAttributes !== prevState.sessionAttributes
    ) {
      this.state.sessionAttributes = {
        ...this.state.sessionAttributes,
        ...this.props.sessionAttributes,
      };
    }

    if (this.props.greeting && this.props.greeting !== prevProps.greeting) {
      const greetingNodeRef = this.greetingMsgRef.current;
      if (greetingNodeRef) {
        greetingNodeRef.textContent = this.props.greeting;
      }
    }
  }

  handleClick() {
    // this.setState({
    //   visible: this.state.visible == "open" ? "closed" : "open",
    // });
    // if (this.props.debugMode === true) {
    //   console.log(this.state);
    // }
  }

  pushChat(event) {
    event.preventDefault();

    var inputFieldText = document.getElementById("inputField");

    if (
      inputFieldText &&
      inputFieldText.value &&
      inputFieldText.value.trim().length > 0
    ) {
      // disable input to show we're sending it
      var inputField = inputFieldText.value.trim();
      inputFieldText.value = "...";
      inputFieldText.locked = true;

      // send it to the Lex runtime
      var params = {
        botAlias: this.props.alias,
        botName: this.props.botName,
        inputText: inputField,
        userId: this.state.lexUserId,
        sessionAttributes: this.state.sessionAttributes,
      };

      if (this.props.debugMode === true) {
        console.log(JSON.stringify(params));
      }

      this.showRequest(inputField);
      var a = function (err, data) {
        if (err) {
          console.log(err, err.stack);
          this.showError(
            "Error:  " + err.message + " (see console for details)"
          );
        }
        if (data) {
          // capture the sessionAttributes for the next cycle
          this.setState({ sessionAttributes: data.sessionAttributes });
          // show response and/or error/dialog status
          this.showResponse(data);
        }
        // re-enable input
        inputFieldText.value = "";
        inputFieldText.locked = false;
      };

      this.lexruntime.postText(params, a.bind(this));
    }
    // we always cancel form submission
    return false;
  }

  showRequest(daText) {
    var conversationDiv = document.getElementById("conversation");
    var requestPara = document.createElement("P");
    requestPara.className = "userRequest";
    requestPara.appendChild(document.createTextNode(daText));
    var spacer = document.createElement("div");
    spacer.className = "convoSpacer";
    spacer.appendChild(requestPara);
    conversationDiv.appendChild(spacer);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  showError(daText) {
    var conversationDiv = document.getElementById("conversation");
    var errorPara = document.createElement("P");
    errorPara.className = "lexError";
    errorPara.appendChild(document.createTextNode(daText));
    var spacer = document.createElement("div");
    spacer.className = "convoSpacer";
    spacer.appendChild(errorPara);
    conversationDiv.appendChild(spacer);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  showResponse(lexResponse) {
    var conversationDiv = document.getElementById("conversation");
    var responsePara = document.createElement("P");
    responsePara.className = "lexResponse";
    console.log("lexResponse: " + JSON.stringify(lexResponse));
    if (lexResponse.message) {
      console.log("lexResponse.message: " + JSON.stringify(lexResponse.message));
      try{
        let lexResponseMessageJSON = JSON.parse(lexResponse.message);
        if(lexResponseMessageJSON.type == "random"){
          let randomResponseArray = lexResponseMessageJSON.message;
          let randomResponseNumber = Math.floor(Math.random()*randomResponseArray.length);
          let randomResponse = randomResponseArray[randomResponseNumber];
          let randomResponseDiv = document.createElement("div");
          randomResponseDiv.appendChild(document.createTextNode(randomResponse));
          let randomResponseLink = document.createElement("button");
          randomResponseLink.innerHTML = "see more";
          let randomResponseLinkDiv = document.createElement("div");
          randomResponseLinkDiv.appendChild(randomResponseLink);
          function lessResponse(){
            randomResponseDiv.innerHTML = "";
            randomResponseDiv.appendChild(document.createTextNode(randomResponse));
            randomResponseDiv.appendChild(randomResponseLinkDiv);
          }
          function fullResponse(){
            randomResponseDiv.innerHTML = "";
            let firstBulletPoint = document.createElement('li');
            firstBulletPoint.innerHTML = randomResponse;
            randomResponseDiv.appendChild(firstBulletPoint);
            for(let i = 0; i < randomResponseArray.length; i++){
              if(i == randomResponseNumber){
                continue;
              }
              let thisBulletPoint = document.createElement('li');
              thisBulletPoint.innerHTML = randomResponseArray[i];
              randomResponseDiv.appendChild(thisBulletPoint);
            }
            let seeLess = document.createElement("button");
            seeLess.innerHTML = "see less";
            seeLess.onclick = lessResponse;
            let seeLessDiv = document.createElement("div");
            seeLessDiv.appendChild(seeLess);
            randomResponseDiv.appendChild(seeLessDiv)
          }
          randomResponseLink.onclick = fullResponse;
          randomResponseDiv.appendChild(randomResponseLinkDiv);
          responsePara.appendChild(randomResponseDiv);
        } /*else if(lexResponseMessageJSON.type == "html"){

        }*/
      } catch (error){
        if(lexResponse.message[0] == "<"){
          let htmlString = lexResponse.message;
          let doc = new DOMParser().parseFromString(htmlString, "text/html");
          let body = doc.childNodes[0].childNodes[1];
          let bodyInnerHTML = body.innerHTML;
          responsePara.innerHTML = bodyInnerHTML;
        }
        else if("responseCard" in lexResponse){
          let genericAttachments = lexResponse["responseCard"]["genericAttachments"][0];
          let title = genericAttachments["title"];
          let subtitle = genericAttachments["subTitle"];
          let imageUrl = genericAttachments["imageUrl"];
          let buttons = genericAttachments["buttons"];
          let responseCardDiv = document.createElement("div");
          responseCardDiv.style.textAlign = "center";
          let responseCardImg = document.createElement("img");
          responseCardImg.src = imageUrl;
          responseCardImg.style.maxHeight = "20vh";
          responseCardImg.style.maxWidth = "20vw";
          if(imageUrl != null){
            responseCardDiv.appendChild(responseCardImg);
          }
          let titleDiv = document.createElement("div");
          titleDiv.innerHTML = title;
          titleDiv.style.fontWeight = "bold";
          responseCardDiv.appendChild(titleDiv);
          let subTitleDiv = document.createElement("div");
          subTitleDiv.innerHTML = subtitle;
          subTitleDiv.style.color = "grey";
          responseCardDiv.appendChild(subTitleDiv);
          for(let i = 0; i < buttons.length; i++){
            let responseButtonDiv = document.createElement("div");
            let responseButtons = document.createElement("button");
            responseButtons.innerHTML = buttons[i].text;
            responseButtons.value = buttons[i].value;
            let objectThis = this;

            responseButtons.addEventListener("click",function(){
              objectThis.buttonMessage(true, responseButtons.value, responseButtons.innerHTML);
            });
            responseButtonDiv.appendChild(responseButtons);
            responseButtonDiv.style.textAlign = "center";
            responseButtons.style.fontSize = "20px";
            responseCardDiv.appendChild(responseButtonDiv);
          }
          responsePara.appendChild(responseCardDiv);
        }else{
          responsePara.appendChild(document.createTextNode(lexResponse.message));
        }
      }
    }
    if (lexResponse.dialogState === "ReadyForFulfillment") {
      responsePara.appendChild(
        document.createTextNode("Ready for fulfillment")
      );
    }
    //open embedded link in a new tab
    let linkArray = responsePara.getElementsByTagName("a");
    for (let i = 0; i < linkArray.length; i++){
      linkArray[i].setAttribute("target","_blank");
      linkArray[i].setAttribute("rel", "noopener noreferrer");
    }
    var spacer = document.createElement("div");
    spacer.className = "convoSpacer";
    spacer.appendChild(responsePara);
    conversationDiv.appendChild(spacer);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
    if(lexResponse.intentName == null){
      let userMessages = document.getElementsByClassName("userRequest");
      let lastUserMessageElement = userMessages[userMessages.length - 1];
      let lastUserMessage = lastUserMessageElement.innerHTML;
      let responsePara2 = document.createElement("p");
      // this calls Case Western's Google Custom Search Engine API through a proxy because we never got the authenticatino token
      // from the team who manages this API. This worked when we first tested it, but now it throws an error saying we don't
      // have access. So, in the future if you can communicate with the people at CWRU who manage this API and get the authentication
      // you can use the link below (you don't need the "https://desolate-mountain-77457.herokuapp.com/" part if you have the auth token that's
      // the proxy we used to try to evade the authentication)
      axios.get("https://desolate-mountain-77457.herokuapp.com/https://cse.google.com/cse/element/v1?rsz=filtered_cse&num=10&hl=en&source=gcsc&gss=.com&cselibv=3e1664f444e6eb06&cx=004305171799132815236:ciq4c8b3yv4&q=" + lastUserMessage + "&safe=off&cse_tok=AJvRUv1K0BYXuxBIUJsAUFWk07BU:1650672845036&sort=&exp=csqr,cc&oq=" + lastUserMessage + "&gs_l=partner-generic.3...0.0.0.11460.0.0.0.0.0.0.0.0..0.0.csems%2Cnrl%3D13...0.0....34.partner-generic..0.0.0.&callback=google.search.cse.api5565")
          .then(function (response) {
            let responseData = response.data;
            let responseDataReplace1 = responseData.replace("/*O_o*/", "");
            let responseDataReplace2 = responseDataReplace1.replace("google.search.cse.api5565(", "");
            let responseDataReplace3 = responseDataReplace2.replace(");", "");
            console.log(responseDataReplace3);
            let responseDataParsed = JSON.parse(responseDataReplace3);
            console.log(responseDataParsed);
            let results = responseDataParsed.results;
            responsePara2 = document.createElement("p");
            responsePara2.className = "lexResponse";
            let responseList = document.createElement("ol");
            responsePara2.appendChild(responseList);
            try{
                for(let i = 0; i < results.length && i < 4; i++){
                  let thisResult = results[i];
                  let thisResultTitle = thisResult.title;
                  let thisResultURL = thisResult.url;
                  let responseString = "<li><a target='_blank', rel='noopener noreferrer' href=\"" + thisResultURL + "\">" + thisResultTitle + "</a></li>";
                  let wrapper = document.createElement('div');
                  wrapper.innerHTML = responseString;
                  let responseHTML = wrapper.firstChild;
                  responseList.appendChild(responseHTML);
                }
            } catch (error) { // if the API says authentication is needed, then a single link is sent which directs the user to the CWRU search page
                responsePara2 = document.createElement("P");
                let searchUrl = "https://case.edu/search-results/?q=" + lastUserMessage;
                let responseString = "<p>Perhaps you can find answers at this <a target='_blank', rel='noopener noreferrer' href=\"" + searchUrl + "\">link</a>.</p>";
                let wrapper = document.createElement('div');
                wrapper.innerHTML = responseString;
                let responseHTML = wrapper.firstChild;
                responseHTML.className = "lexResponse";
                responsePara2.className = "";
                responsePara2.appendChild(responseHTML);
            } finally {
                if (lexResponse.dialogState === "ReadyForFulfillment") {
                  responsePara2.appendChild(
                    document.createTextNode("Ready for fulfillment")
                  );
                }
                spacer = document.createElement("div");
                spacer.className = "convoSpacer";
                spacer.appendChild(responsePara2);
                conversationDiv.appendChild(spacer);
                conversationDiv.scrollTop = conversationDiv.scrollHeight;
            }
          }
      )
    }
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ data: event.target.value });
  }

  render() {
    const inputStyle = {
      padding: "4px",
      fontSize: 24,
      width: "100%",
      height: "8vh",
      borderRadius: "1px",
      border: "10px",
    };

    const conversationStyle = {
      width: "100%",
      height: "80vh",
      border: "px solid #ccc",
      backgroundColor: this.props.backgroundColor,
      padding: "4px",
      overflow: "scroll",
      borderBottom: "thin ridge #bfbfbf",
    };

    const defaultHeaderRectStyle = {
      backgroundColor: "#000000",
      width: "100%",
      height: "5vh",
      textAlign: "center",
      paddingTop: 12,
      paddingBottom: 12,
      display: "flex",
      alignItems: "center",
      color: "#FFFFFF",
      fontSize: "24px",
      justifyContent: "space-between",
    };

    const headerReactStyle = merge(
      defaultHeaderRectStyle,
      this.props.headerStyle
    );

    const chatcontainerStyle = {
      backgroundColor: "#FFFFFF",
      width: "100%",
    };

    const chatFormStyle = {
      margin: "1px",
      padding: "2px",
    };
    const chatwrapperStyle = {
      bottom: 0,
      fontSize: "12px",
      right: 0,
      position: "fixed",
      width: this.props.width,
      height: "100vh",
      paddingBottom: "1px",
      marginBottom: "1%",
      marginLeft: this.props.margin,
      marginRight: this.props.margin,
      resize: "both",
      overflow: "auto",
      position: "static"
    }
    return (
      <div id="chatwrapper" style = {chatwrapperStyle}>
        <div
          id="chat-header-rect"
          style={headerReactStyle}
          onClick={this.handleClick}
        >
          <span />
          <span
            style={{
              fontSize: headerReactStyle.fontSize,
              color: headerReactStyle.color,
            }}
          >
            {this.props.headerText}
          </span>

          {this.state.visible === "open" ? (
            <span className=""></span>
           ) : (
            <span className=""></span>
           )}

        </div>
        <div
          id="chatcontainer"
          className={this.state.visible}
          style={chatcontainerStyle}
        >
          <div
            id="conversation"
            ref={this.conversationDivRef}
            style={conversationStyle}
          />
          <form
            id="chatform"
            style={chatFormStyle}
            onSubmit={this.pushChat.bind(this)}
          >
            <input
              type="text"
              id="inputField"
              size="40"
              value={this.state.data}
              placeholder={this.props.placeholder}
              onChange={this.handleChange.bind(this)}
              style={inputStyle}
            />
          </form>
        </div>
      </div>
    );
  }
}

MyLexChat.propTypes = {
  alias: PropTypes.string,
  botName: PropTypes.string,
  IdentityPoolId: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  headerText: PropTypes.string,
  headerColor: PropTypes.string,
  headerBackgroundColor: PropTypes.string,
  headerFontSize: PropTypes.number,
  sessionAttributes: PropTypes.object,
  debugMode: PropTypes.bool,
  width: PropTypes.string,
  margin: PropTypes.string,
};

MyLexChat.defaultProps = {
  alias: "$LATEST",
  headerStyle: {},
  greeting: "",
  sessionAttributes: {},
  debugMode: false,
};

export default MyLexChat;
