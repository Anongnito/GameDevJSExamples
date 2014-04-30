#pragma strict
private var notificator:ServerNotifications;
private var chat:LobbyAndChat;
private var playerInstantiator:PlayerInstantiator;
private var globalScore : String;
private var loggedIn = false;
private var guiScript: GUIScript;

function Awake () {
	guiScript = GetComponent(GUIScript);
	chat = GetComponent(LobbyAndChat);
	notificator = GetComponent(ServerNotifications);
	playerInstantiator = GetComponent(PlayerInstantiator);
	globalScore = "Error recieving player list";
}

function receiveCommand(command:Command):void {
	if(command.isOfType(Type.CHAT)) {
		chat.receiveChatMessage(command.content);
	} else if (command.isOfType(Type.RETURNLOBBYLIST)){
		chat.receivePlayerList(command.content);
	} else if (command.isOfType(Type.REGISTERREPLY)){
		receiveRegistrationReply(command.content);
	} else if (command.isOfType(Type.LOGINSUCCESS)){
		loginSuccess(command.content);
	} else if (command.isOfType(Type.LOGINFAIL)){
		GetComponent(LoginScreen).feedbackText = command.content;
	} else if (command.isOfType(Type.PLAYERMOVES)) {
		movePlayerTo(command.content);
	} else if (command.isOfType(Type.RUNACTIVATED)) {
		makePlayerRun(command.content);
	} else if (command.isOfType(Type.RUNDEACTIVATED)) {
		endPlayerRun(command.content);
	} else if (command.isOfType(Type.POPUP)) {
		notificator.receivedPopup(command.content);
	} else if (command.isOfType(Type.CONFIRMPOPUP)) {
		notificator.receivedConfirm(command.content);
	} else if (command.isOfType(Type.TRANSFER)) {
		transferToGame(command.content);
	} else if (command.isOfType(Type.GLOBALSCORE)) {
		globalScore = command.content;
	} else if (command.isOfType(Type.GETRIDDLE)) {
		getRiddle(command.content);
	} else if (command.isOfType(Type.GATHER)) {
		gather(command.content);
	} else if (command.isOfType(Type.ADDITEMTOINVENTORY)) {
		addItemToInventory(command.content);
	} else if (command.isOfType(Type.DELETEITEM)) {
		deleteItem(command.content);	
	} else if (command.isOfType(Type.SWITCHITEMS)) {
		switchItems(command.content);	
	} else if (command.isOfType(Type.GATHEREDCONTAINER)) {
		gatheredContainers(command.content);
	} else if (command.isOfType(Type.GATHERABLECONTAINERRESPAWN)) {
		gatherableContainerRespawn(command.content);
	} else if (command.isOfType(Type.REMOVEITEM)) {
		removeItem(command.content);
	} else {
		playerInstantiator.executeCommand(command);
	}
}

function receiveRegistrationReply(result:String):void {
	Debug.Log(result + "SUCCESS");
	if(result == "SUCCESS\n"){
		GetComponent(LoginScreen).feedbackText = "Registreerimine õnnestus";
		GetComponent(LoginScreen).enabled = true;
		GetComponent(Registration).enabled = false;
	} else {
		GetComponent(LoginScreen).feedbackText = "Registreerimine ebaõnnestus: " + result;
	}
}

function loginSuccess(content:String):void {
	Debug.Log("login success");
	loggedIn = true;
	var parts = content.Split(";"[0]);
	var location:Vector3 = new Vector3();
	location.x = double.Parse(parts[1]);
	location.y = double.Parse(parts[2]);		
	location.z = double.Parse(parts[3]);
	var gender:Gender = getGender(parts[5]);
	playerInstantiator.instantiateMyPlayer(int.Parse(parts[0]), location, parts[4], gender, parts[6], double.Parse(parts[7]), parts[8]);
	GetComponent(Raycaster).enabled = true;
	GetComponent(LoginScreen).enabled = false;
	GetComponent(GUIglobalScore).enabled = true;
	GetComponent(MuteSound).enabled = true;
	GetComponent(SingleplayerMinigames).enabled = true;
	GetComponent(AnimationGUI).enabled = true;
	chat.openChat();
	guiScript.isInWorld = true;
	enableGUI();
	//sendCommand("REQUESTPLAYERLIST", "");
}

function getGender(input:String):Gender {
	if(input == "m")
		return Gender.BOY;
	else
		return Gender.GIRL;
}

function movePlayerTo(content:String):void {
	var destination:Vector3 = new Vector3();
	var idToMove:int;
	var parts = content.Split(";"[0]);
	idToMove = int.Parse(parts[0]);
	destination.x = double.Parse(parts[1]);
	destination.y = double.Parse(parts[2]);		
	destination.z = double.Parse(parts[3]);
	Debug.Log("SHOULD MOVE TO" + destination);
	playerInstantiator.getPlayerById(idToMove).GetComponent(PlayerMovement).moveTo(destination);
}

function makePlayerRun(content:String):void {
	var idToMove:int = int.Parse(content);
	playerInstantiator.getPlayerById(idToMove).GetComponent(PlayerMovement).increaseSpeed(9);
}

function endPlayerRun(content:String):void {
	var idToMove:int = int.Parse(content);
	playerInstantiator.getPlayerById(idToMove).GetComponent(PlayerMovement).decreaseSpeed(9);
}

function transferToGame(transferInfo:String):void {
	Debug.Log("should transfer..." + transferInfo);
	var parts = transferInfo.Split(";"[0]);
	Debug.Log("Parts:" + parts[0] + " and " + parts[1]);
	if(parts[1].Contains("\n")) {
		parts[1] = parts[1].Replace("\n", "");
	}
	Application.ExternalCall("redirectToMinigame", parts[0], parts[1]);
}

function getGlobalScore() : String {
	return globalScore.Replace(";","\n");
}

function getRiddle(content:String):void {
	content = "Küsimus;Vastus1;Vastus2;Vastus3;Vastus4";
	Debug.Log(content);
	var parts = content.Split(";"[0]);
	Debug.Log(parts);
	Camera.main.GetComponent(NPCInteractionWindow).riddleToGUI(parts);
}

function ifLoggedIn() : boolean {
	return loggedIn;
}

function gather(content:String) : void {
	var parts = content.Split(";"[0]);
	Debug.Log("GATHER:" + content);
	for(var gatherableItem : GameObject in GameObject.FindGameObjectsWithTag("GatherableItem")){
	    if(gatherableItem.transform.FindChild("Collider").GetComponent(GatherableItemScript).checkIfGatheredItem(int.Parse(parts[0]),int.Parse(parts[1]))){
	        gatherableItem.transform.FindChild("Collider").GetComponent(GatherableItemScript).setGatheredTo(true);
	    }
	}
}

function addItemToInventory(content:String) : void {
	var parts = content.Split(";"[0]);
	GameObject.FindGameObjectWithTag("myPlayer").transform.GetComponent(InventoryGatherable).slotItem(Camera.main.GetComponent(GatherableItemType).getItemAt(int.Parse(parts[1])), int.Parse(parts[0]));
}

function deleteItem(content:String) : void {
	GameObject.FindGameObjectWithTag("myPlayer").transform.GetComponent(InventoryGatherable).deleteItem(int.Parse(content));
}

function switchItems(content:String) : void {
	var parts = content.Split(";"[0]);
	GameObject.FindGameObjectWithTag("myPlayer").transform.GetComponent(InventoryGatherable).switchItems(int.Parse(parts[0]), int.Parse(parts[1]));
}

function gatheredContainers(content:String) : void {
	var parts:String[] = content.Split(";"[0]);
	for(var j:int=0; j<parts.length; j++){
		var tempArray:String[] = parts[j].Replace("[", "").Replace("]", "").Replace(" ", "").Split(":"[0]);
		if(tempArray[1]== ""){
			if(tempArray[1]== null){
				Debug.Log(tempArray[1] + ": TempArrayForGATHEREDCONTAINERS");
				GetComponent(GatherableItemContainerManager).removeContainers(int.Parse(parts[j].Substring(0,parts[j].IndexOf("[")-1)), tempArray[1].Split(","[0]));
			}
		}
	}
}

function gatherableContainerRespawn(content:String) : void {
	var parts:String[] = content.Replace(" ","").Split(":"[0]);
	GetComponent(GatherableItemContainerManager).instantiateContainer(int.Parse(parts[0]), int.Parse(parts[1]));
}

function removeItem(content:String):void {
	GameObject.FindGameObjectWithTag("myPlayer").transform.GetComponent(InventoryGatherable).deleteItem(int.Parse(content));
}

function enableGUI () {
	var guis = GameObject.FindGameObjectsWithTag("GUI");
	for(var gui:GameObject in guis){
		gui.transform.GetComponent(GUITexture).enabled = true;
	}
}