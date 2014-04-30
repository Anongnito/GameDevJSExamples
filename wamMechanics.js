#pragma strict
var bug1prefab : Transform;
var bug2prefab : Transform;

var isGameRunning : boolean;
var bugTypeArray:Array;
var bug;
private var gameLogic: GameLogic;

//starting locations logic
var startingLocations : Array;
var lastSpawnLocation : int;

//spawn bug logic
var spawnRate : float;
var spawnRateMinimum : float;
var spawnRateIncreaseAmount : float;
var spawnBug : boolean;
var respawnTime : float;

var defaultTime : float; // not to give points for not playing

//health logic
var maxHealth : float = 100;
private var health : float = 0;
private var opponentHealth : float = 0;
var hpLossOnBugGoal : int = 5;
var hpLossOnMisClick : int = 2;

function Awake() {
	gameLogic = Camera.main.GetComponent(GameLogic);
	isGameRunning = false;
	spawnRateMinimum = 0.25;
	spawnRateIncreaseAmount = 0.02;
	defaultTime = 9.3;
	bugTypeArray = new Array(bug1prefab, bug2prefab);
}


function Update() {
	if(isGameRunning){
		respawnCheck();
	}
}

function startGame() {
	Camera.main.GetComponent(wamScore).resetScore();
	Camera.main.GetComponent(wamGUI).welcomeScreen = false;
	startingLocations = new Array (Vector3(-15, -7, 0), Vector3(-15, -4, 0), Vector3(-15, -1, 0), Vector3(-15, 2, 0), Vector3(-15, 5, 0));
	spawnBug = true;
	bugSpawner();
	spawnRate = 1.2;
	respawnTime = 0;
	isGameRunning = true;
	health = maxHealth;
	opponentHealth = maxHealth;
	gameLogic.player1Ready = false;
	gameLogic.player2Ready = false;
	gameLogic.myPlayerReady = false;
	Camera.main.GetComponent(wamTimer).startRoundLength();
}

function endGame() {
	isGameRunning = false;
	destroyAllBugs();
	Camera.main.GetComponent(wamTimer).endRoundPreparation();
	Camera.main.GetComponent(ServerConnection).sendCommand(Type.ROUNDRESULT, Camera.main.GetComponent(wamScore).getScore()+"");
	Camera.main.GetComponent(wamGUI).showScoreScreen();
}

function destroyAllBugs() {
	var bugArray:UnityEngine.Object[] = GameObject.FindGameObjectsWithTag("bug1");
	for(var bug in bugArray) {
		Destroy(bug);
	}
	bugArray = GameObject.FindGameObjectsWithTag("bug2");
	for(var bug in bugArray) {
		Destroy(bug);
	}
}

function bugSpawner() {
	var bugLocation:int = Mathf.Floor(Random.Range(0,5));
	while(bugLocation == lastSpawnLocation){
		bugLocation = Mathf.Floor(Random.Range(0,5));
	}
	lastSpawnLocation = bugLocation;
	
	var bugType:int = Mathf.Floor(Random.Range(0,2));
    bug = GameObject.Instantiate(bugTypeArray[bugType], new Vector3(0,0,0), Quaternion.identity);
    (bug as Transform).position = startingLocations[bugLocation];

}

function respawnCheck() {
	respawnTime += Time.deltaTime;
	if(respawnTime > spawnRate){
		bugSpawner();
		respawnTime = 0;
		spawnRate -= spawnRateIncreaseAmount;
		if(spawnRate < spawnRateMinimum)
			spawnRate = spawnRateMinimum;
	}
}

function getHealth():float{
	return health;
}

function getMaxHealth():float{
	return maxHealth;
}


function loseHealth(hploss:int) {
	health = health -hploss;
	Camera.main.GetComponent(ServerConnection).sendCommand(Type.UPDATERESULTS, hploss+"");
	Debug.Log("elud hetkel: " + health);
	if(health <= 0)
		endGame();
}

function getOpponentHealth():float {
	return opponentHealth;
}

function setOpponentHealth(content:String):void {
	opponentHealth = float.Parse(content);
}