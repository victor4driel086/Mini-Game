/* script.js
   Troque prizeUrl pela URL do site de "prêmio" que você criará. */
const prizeUrl = "premio.html"; // abre um arquivo local
const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");
const toast = document.getElementById("toast");
const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
];

const symbols = ["❌","💙","💎","⭐","⚠️","🍀","💌","🌟"]; // neutro e romântico
const ATTEMPTS_KEY = "slotAttempts";

/* Helper: get attempts from localStorage */
function getAttempts(){
  const v = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10);
  return isNaN(v) ? 0 : v;
}
function setAttempts(n){
  localStorage.setItem(ATTEMPTS_KEY, String(n));
}

/* Initialize */
(function(){
  if (!localStorage.getItem(ATTEMPTS_KEY)) setAttempts(0);
})();

/* Show toast with transition */
let toastTimer = null;
function showToast(text, type="neutral", duration=2200){
  toast.className = "toast " + (type === "lose" ? "lose" : "");
  toast.textContent = text;
  // show
  requestAnimationFrame(() => toast.classList.add("show"));
  // clear previous
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* Simple reel animation: set symbols with small delays and play CSS animation */
function spinReels(finals = ["❇️","❇️","❇️"]){
  // add spin class for micro animation
  reels.forEach(r => r.classList.remove("spin"));
  // quickly cycle symbols, then settle
  const cycles = 10;
  for (let i=0;i<cycles;i++){
    setTimeout(()=>{
      reels.forEach(r=>{
        r.textContent = symbols[Math.floor(Math.random()*symbols.length)];
        r.classList.add("spin");
      });
    }, i * 80);
  }
  // settle each reel slightly staggered
  finals.forEach((sym, idx) => {
    setTimeout(()=>{
      reels[idx].textContent = sym;
      reels[idx].classList.remove("spin");
    }, (cycles*80) + idx*140);
  });
}

/* Determine outcome: force loss twice, win on third attempt */
function determineOutcome(attempts){
  // attempts is number of previous attempts (0-based). We will increment then evaluate.
  // After increment:
  const next = attempts + 1;
  const willWin = (next % 3 === 0); // 3,6,9 -> win
  return { willWin, next };
}

/* Update button text & behavior */
function updateButtonToState(state){
  // state: "play", "retry", "prize"
  if(state === "play"){
    playBtn.textContent = "Jogar";
    playBtn.classList.remove("prize");
    playBtn.disabled = false;
    playBtn.onclick = onClickPlay;
  } else if(state === "retry"){
    playBtn.textContent = "Tentar novamente";
    playBtn.onclick = onClickPlay;
    playBtn.disabled = false;
  } else if(state === "prize"){
    playBtn.textContent = "Receber prêmio";
    playBtn.onclick = onClickPrize;
    playBtn.disabled = false;
  }
}

/* Click handlers */
function onClickPlay(){
  playBtn.disabled = true; // avoid double taps
  const attempts = getAttempts();
  const { willWin, next } = determineOutcome(attempts);

  // spin visuals: choose finals based on willWin
  if (willWin){
    // matching symbols for win
    const sym = "💌";
    spinReels([sym, sym, sym]);
    // small delay to match animation
    setTimeout(()=> {
      showToast("PARABÉNS, VOCÊ VENCEU!", "win", 3500);
      // update attempts and UI
      setAttempts(next);
      updateButtonToState("prize");
      // create quick micro-confetti
      fireMicroConfetti();
      playBtn.disabled = false;
    }, 1200);
  } else {
    // show different symbols to indicate loss
    const s1 = symbols[Math.floor(Math.random()*symbols.length)];
    let s2 = symbols[Math.floor(Math.random()*symbols.length)];
    let s3 = symbols[Math.floor(Math.random()*symbols.length)];
    // ensure NOT all equal
    if (s1 === s2 && s2 === s3){
      s3 = symbols[(symbols.indexOf(s3)+1) % symbols.length];
    }
    spinReels([s1,s2,s3]);
    setTimeout(()=> {
      showToast("Você perdeu", "lose", 2200);
      setAttempts(next);
      updateButtonToState("retry");
      playBtn.disabled = false;
    }, 1100);
  }
}

function onClickPrize(){
  window.location.href = prizeUrl; // abre localmente na mesma aba
  // se quiser resetar o contador, pode manter:
  setAttempts(0);
  updateButtonToState("play");
  showToast("Prêmio resgatado — bom uso!", "win", 1800);
}

/* reset handler for testing */
resetBtn.addEventListener("click", ()=>{
  setAttempts(0);
  updateButtonToState("play");
  showToast("Contador reiniciado", "neutral", 1400);
});

/* confetti (micro) */
function fireMicroConfetti(){
  // small, short-lived colored DOM elements falling
  const parent = document.querySelector(".slot-machine");
  for (let i=0;i<50;i++){
    const c = document.createElement("div");
    c.style.position = "absolute";
    c.style.left = (20 + Math.random()*80) + "%";
    c.style.top = "-10px";
    c.style.fontSize = (10 + Math.random()*16) + "px";
    c.style.opacity = "0.95";
    c.textContent = ["✨","💙","🎉","🌟","💠","⭐"][Math.floor(Math.random()*6)];
    c.style.transform = `rotate(${Math.random()*360}deg)`;
    c.style.pointerEvents = "none";
    parent.appendChild(c);
    const dur = 1100 + Math.random()*900;
    c.animate([
      { transform: c.style.transform + " translateY(100px)", opacity:1 },
      { transform: c.style.transform + " translateY(140px) rotate(40deg)", opacity:0.05 }
    ], { duration: dur, easing: "cubic-bezier(.2,.9,.3,1)" });
    setTimeout(()=> c.remove(), dur+50);
  }
}

/* initial button state depending on attempts */
(function initUI(){
  const attempts = getAttempts();
  // Decide label: if last action was win (i.e., last attempt %3 === 0 and attempts>0), show prize.
  if (attempts > 0 && (attempts % 3 === 0)){
    updateButtonToState("prize");
  } else if (attempts === 0){
    updateButtonToState("play");
  } else {
    updateButtonToState("retry");
  }
})();

/* expose handler for direct onclick */
function onLoadAttach(){
  playBtn.onclick = onClickPlay;
}
onLoadAttach();