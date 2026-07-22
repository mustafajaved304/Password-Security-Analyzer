const breachedPasswords = {
  "password123":120,"123456":200,"admin":95,"welcome":80,"qwerty":150
};

function goToDashboard(){
  const v=document.getElementById("passwords").value.trim();
  if(!v) return alert("Enter password");
  localStorage.setItem("passwords",JSON.stringify(v.split("\n")));
  location.href="dashboard.html";
}
function goBack(){localStorage.clear();location.href="index.html";}

function strength(p){
  let s=0;
  if(p.length>=8)s++;
  if(p.length>=12)s++;
  if(/[A-Z]/.test(p))s++;
  if(/[a-z]/.test(p))s++;
  if(/[0-9]/.test(p))s++;
  if(/[!@#$%^&*]/.test(p))s++;
  return s;
}
function crackTime(s){
  return ["Seconds","Minutes","Hours","Months","Years"][Math.min(s,4)];
}
function breach(p){
  return breachedPasswords[p.toLowerCase()]||0;
}
function policy(p){
  return [
    ["Min 8 chars",p.length>=8],
    ["Uppercase",/[A-Z]/.test(p)],
    ["Lowercase",/[a-z]/.test(p)],
    ["Number",/[0-9]/.test(p)],
    ["Special Char",/[!@#$%^&*]/.test(p)]
  ];
}

function runDashboard(){
  const list=JSON.parse(localStorage.getItem("passwords"));
  if(!list)return;

  let riskCount={LOW:0,MEDIUM:0,HIGH:0};

  list.forEach(p=>{
    let s=strength(p);
    let risk=s<=2?"HIGH":s<=4?"MEDIUM":"LOW";
    riskCount[risk]++;

    document.getElementById("cardsContainer").innerHTML+=`
    <div class="card">
      <b>Password:</b> ${p}<br>
      <b>Strength:</b> ${s}/6<br>
      <b>Crack Time:</b> ${crackTime(s)}<br>
      <b>Risk:</b> ${risk}
    </div>`;

    policy(p).forEach(r=>{
      document.getElementById("policyRules").innerHTML+=`
      <div class="card ${r[1]?"pass":"fail"}">${r[0]} : ${r[1]?"✔":"❌"}</div>`;
    });

    [["Brute Force",s<=2?90:30],["Dictionary",s<=3?80:20],["Credential Stuffing",s<=3?70:15]]
    .forEach(a=>{
      document.getElementById("attackSimulation").innerHTML+=`
      <div class="card ${a[1]>50?"fail":"pass"}">${a[0]} : ${a[1]}%</div>`;
    });

    let b=breach(p);
    document.getElementById("breachStatus").innerHTML+=`
    <div class="card ${b?"fail":"pass"}">
      ${b?"❌ Found in "+b+" breaches":"🟢 Not in breaches"}
    </div>`;

    [["NIST",p.length>=8&&!b],["ISO",s>=4],["OWASP",s>=4&&!b]]
    .forEach(st=>{
      document.getElementById("standardsCompliance").innerHTML+=`
      <div class="card ${st[1]?"pass":"fail"}">${st[0]} : ${st[1]?"Compliant":"Not Compliant"}</div>`;
    });
  });

  new Chart(document.getElementById("riskChart"),{
    type:"bar",
    data:{labels:["HIGH","MEDIUM","LOW"],
    datasets:[{data:[riskCount.HIGH,riskCount.MEDIUM,riskCount.LOW]}]},
    options:{plugins:{legend:{display:false}}}
  });
}

if(location.pathname.includes("dashboard")) runDashboard();

// ================= SECURE PASSWORD GENERATOR =================
function generatePassword() {
    const length = parseInt(document.getElementById("pwLength").value);

    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+{}[]<>?";

    const all = upper + lower + numbers + symbols;

    let password = [
        upper[randomIndex(upper)],
        lower[randomIndex(lower)],
        numbers[randomIndex(numbers)],
        symbols[randomIndex(symbols)]
    ];

    while (password.length < length) {
        password.push(all[randomIndex(all)]);
    }

    password = shuffle(password).join("");
    document.getElementById("generatedPassword").value = password;
}

function randomIndex(chars) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % chars.length;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomIndex(arr);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function useGeneratedPassword() {
    const gen = document.getElementById("generatedPassword").value;
    if (!gen) {
        alert("Generate a password first");
        return;
    }
    document.getElementById("passwords").value = gen;
}
