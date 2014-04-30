#pragma strict
private var audioClips:Hashtable = new Hashtable();
private var audioCollections:Hashtable = new Hashtable();
private var audioPlayer:WorldAudioPlayer;

function Awake() {
	audioPlayer = Camera.main.GetComponent(WorldAudioPlayer);
	
	var click1:AudioClip = Resources.Load("sounds/Click_01");
	var click2:AudioClip = Resources.Load("sounds/Click_02");
	var click3:AudioClip = Resources.Load("sounds/Click_03");
	var clickCollection:SoundEffectCollection = new SoundEffectCollection([click1, click2, click3]);
	addCollection("click", clickCollection);
	
	var ding:AudioClip = Resources.Load("sounds/Ding01");
	addClip("ding", ding);
}

function addClip(name:String, clip:AudioClip):void {
	audioClips.Add(name, clip);
}

function addCollection(name:String, collection:SoundEffectCollection):void {
	audioCollections.Add(name, collection);
}

function playClip(name):void {
	playClip(name, transform);
}

function playClip(name:String, transform:Transform):void {
	var clip:AudioClip = audioClips[name];
	if(clip == null){
		Debug.Log("AUDIO NOT FOUND");
		return;
	}
	audioPlayer.Play(clip, transform);
}

function playNextFromCollection(name):void {
	playNextFromCollection(name, transform);
}

function playNextFromCollection(name:String, transform:Transform):void {
	var collection:SoundEffectCollection = audioCollections[name];
	if(collection == null){
		Debug.Log("AUDIO COLLECTION NOT FOUND");
		return;
	}
	audioPlayer.Play(collection.getNextAudio(), transform); //might be broken, see playRandomFromCollection for fix hint
}

function playRandomFromCollection(name):void {
	playRandomFromCollection(name, transform);
}

function playRandomFromCollection(name:String, transform:Transform):void {
	if(!audioCollections.Contains(name)){
		Debug.Log("AUDIO COLLECTION NOT FOUND");
		return;
	}
	var collection = audioCollections[name];
	audioPlayer.Play((collection as SoundEffectCollection).getRandomAudio(), transform);
}