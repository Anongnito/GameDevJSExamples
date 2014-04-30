#pragma strict
import System.Net.Sockets;
import System.IO;

private var client:TcpClient;
private var stream:NetworkStream;
private var writer:StreamWriter;
private var reader:StreamReader;
private var serverNotifications:ServerNotifications;
private var gameLogic:GameLogic;

private var isConnected:boolean = false;
private var authentication:String;

private var officeIp:String = "192.168.1.106";
private var officePort:int = 500;
private var ip:String;
private var port:int;

function Awake() {
	serverNotifications = Camera.main.GetComponent(ServerNotifications);
	gameLogic = Camera.main.GetComponent(GameLogic);
	if (Application.isEditor) {
	    connectToServer(officeIp, officePort);
	} else {
		fetchServerIp();
	}
}

function Update () {
	if(isConnected){
		readStream();
	}
}

function fetchServerIp():void {
	Application.ExternalCall("fetchServerIpAndPort");
}

function receiveIpAndPort(newIpAndPort:String):void {
	var parts = newIpAndPort.Split(":"[0]);
	this.ip = parts[0];
	this.port = int.Parse(parts[1]);
	connectToServer(ip, port);
}

function connectToServer(ip:String, port:int) {
	client = new TcpClient(ip, port);
	stream = client.GetStream();
	writer = new StreamWriter(stream);
	reader = new StreamReader(stream);
	isConnected = true;
	Debug.Log("Connected");
	Application.ExternalCall("sendAuthenticationToUnity");
	sendCommand(new Command(Type.CURRENTGAMESTATE, Application.loadedLevelName));
}

function readStream():void {
	if(stream.DataAvailable){
		parseCommandFromStream();
	}
}

function parseCommandFromStream():void {
	try {
		var message:String = reader.ReadLine() + "\n";
		receiveCommand(new Command(message));
		sendCommand(new Command(Type.COMMANDPROCESSED));
	} catch (e:SocketException) {
		if(e.Message == "Read failure") {
			disconnectedFromServer("Ühendus serveriga on katkenud.");
		} else {
			throw e.Message;
		}
	}
}

function receiveCommand(command:Command):void {
	Debug.Log("Received: " + command.type + " with content: " + command.content);
	if (command.isOfType(Type.LOGGEDOUT)) {
		disconnectedFromServer(command.content);
	} else if (command.isOfType(Type.POPUP)) {
		serverNotifications.receivedPopup(command.content);
	} else {
		gameLogic.receiveCommand(command);
	}
}

function sendCommand(type:Type, content:String):void {
	sendCommand(new Command(type, content));
}

function sendCommand(command:Command):void {
	if(isConnected) {
		Debug.Log("Sending: " + command.type + "|" + command.content);
		try {
			writer.WriteLine(command.toTcpString());
			writer.Flush();
		} catch (e: System.Exception) {
			if(e.Message == "Write failure") {
				disconnectedFromServer("Ühendus serveriga on katkenud.");
			} else {
				throw e.Message;
			}
		}
	} else {
		Debug.Log("Not connected to server. Can't send command: " + command.type + "|" + command.content);
		disconnectedFromServer("Serveriga pole ühendust. Proovi mäng uuesti avada.");
	}
}

function disconnectedFromServer(reason:String):void {
	isConnected = false;
	serverNotifications.receivedPopup(reason);
}

function confirmPopup(challengeInfo:String):void {
	var parts = challengeInfo.Split(";"[0]);
	Debug.Log("CONFIMR id: " + parts[0] + " and message " + parts[1]);
	sendCommand(Type.ANSWERCONFIRM, parts[0] + ";true");
}

function receiveAuthentication(authentication:String):void {
	if(authentication == null || authentication == "")
		return;
	this.authentication = authentication;
	sendTransferAuthentication();
}

function sendTransferAuthentication():void {
	sendCommand(Type.TRANSFER, authentication);
}

function getAuthentication() : String {
	return authentication;
}

function isConnectedToServer():boolean {
	return isConnected;
}