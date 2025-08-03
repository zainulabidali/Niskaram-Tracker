import { database } from './firebase.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ✅ Class-wise students list
// ✅ Define all lists inside one object
const allStudents = {
  students3Male: ['Ibrahim Bathisha ', 'Muhammed SM', 'Abdulla MA', 'Muhammed Javad MA', 'Nasrul Azman', 'Muhammed Musthafa', 'Kubaib', 'Muhammed Swalih', 'Abdulla Mirshad', 'Muhammed Saeed', 'Zakwan', 'Adham Abdulla', '🛠️'],
  students3Female: ['Ayshath Muneeba', 'Maryam CA', 'Maryam Zahra', 'Maryam Ahmed Naseer', 'Fathimath Shifa', 'Rifa Fathima', 'Ayshath Shaza', 'Shama Fathima', 'Fathimath Shanza Mahzin', 'Maryam Mehk'],


  students4Male: [, '🛠️'],
  students4Female: [' ',],


  students5Male: ['AHMED SHAMIL BK', 'IBRAHIM SAIS CM', 'MUHAMMED FAYIZ BN', 'MUHAMMED ADIL', 'MUHAMMED SHAMMAS S', 'MOIDEEN SHAZ', 'MUHAMMED JAZEEL', 'ABOOBACKAR SIDDIQUE UM', 'MUHAMMED SHAZIM', 'MUHAMMED SHAMMAS M', 'ZAHID ABBAS AA', '🛠️'],
  students5Female: ['FATHIMA FIDA', 'FATHIMA NOUFEERA KN', 'AYSHA ZAMA MARZIN', 'MARIYAM FABNAZ MA', 'NAFEESATH RIZA KH', 'FATHIMATH ZAKIYYA', 'KADEEJA HADIYA KA', 'AYSHA NOON TK', 'FATHIMA DILNA', 'ASIYA MA', 'AYSHATH RAHEEMA', 'AYSHATH IZHA', 'FATHIMATH FAHEEMA NA', 'FATHIMA CK', 'SHEZA FATHIMA PS', 'FATHIMA FALAQ CA'],


  students6Male: ['MUHAMMED SIBLI', 'ABDUL RAHMAN JAVAD', 'RAMEEM ABOOBAKAR', 'LUKMANUL HAKEEM', 'ABDUL KADER ZIDAN', 'MUHAMMED MISBAH', 'ABDUL KADAR MIDLAJ', 'MUHAMMED AJAS', 'SAMMAS ABDULLA', 'AHMAD AJLAL', 'ABDULLA KS', 'ABDUL MAZHAR', 'MUHEENUDEEN SAHAD', 'MUHAMMED SAFI', 'FARHAN ABDULLA', 'ZAYD', 'ZIYAD', 'MUHAMMED ZAYAN', 'NASHITH MUHAMMED', 'ZAHID MUBARAK','🛠️'],
  students6Female: ['FAHIMA CS', 'FARISA', 'AYSHA S', 'FATHIMA', 'FATHIMATH MUNAZAHA', 'AYSHATH DIYA', 'MARIYAM RUSHDA', 'FATHIMA KA', 'FATHIMATH SAFLA', 'AYISHATH RUSHDA', 'NAFEESATH MISRIYA', 'AYSHATH ZABA', 'RASHA FATHIMA', 'AYSHATH AFREENA', 'SHAMSEERA'],


  students7Male: ['🛠️'],
  students7Female: [],


  students8Male: ['SWALIH MUHAZ K.M', 'SOOFI NIHAL T.A', 'MUHAMMED NABEEL E.A', 'MUHYUDHEEN MUBASHIR T.M', 'NIDHAL ABDULLA', 'AYMAN C.A', 'HAMID A.A', 'ABDULLA ANSAF M.M', 'ABDUL KHADER MIKFAR K.M', 'MUHAMMED SHINAS','🛠️'],
  students8Female: ['FATHIMA C.I', 'FATHIMA U.M', 'FATHIMA NAJA C.A', 'FATHIMA E.A', 'AYSHATH FAZNA D.A', 'FATHIMA NOOHA T.H'],


  students9Male: ['SHUHAIM', 'ABDULLA AFEEF', 'ABDULLA FAHZIN', 'MUHAMMED RISHAL', 'AHMED SHAMMAS','🛠️'],
  students9Female: ['ZAINABATH FAHIMA', 'AYSHATH ASNA', 'FATHIMA FIDHA', 'NADEEMA', 'FATHIMA RUKIYA', 'AYSHATH SAFLA', 'SHAZA MARIYAM', 'AYSHATH AFNA'],


  students10Male: ['ABDULLA ASHIQ', 'ABDULLA', 'MOIDHEEN','🛠️'],
  students10Female: ['NAFEESATH NASBA', 'FATHIMATH THASLEEMA', 'NAFEESATH AMNA', 'NAFEESATH HAFIZA', 'AYSHA BEEVI', 'FATHIMA', 'SHAHZIYA',]
};



const genderRadios = document.getElementsByName('gender');
const nameSelect = document.getElementById('name');
const form = document.getElementById('prayerForm');
const rankList = document.getElementById('rankList');
const classInput = document.getElementById('class');
const dateInput = document.getElementById('date');

dateInput.valueAsDate = new Date();

// 🔄 Update Name Dropdown on class/gender change

function updateNameDropdown() {
  const selectedClass = document.getElementById('class').value;
  const selectedGender = document.querySelector('input[name="gender"]:checked');

  nameSelect.innerHTML = '<option value="">-- പേരെ തിരഞ്ഞെടുക്കുക --</option>';
  if (!selectedClass || !selectedGender) return;

  const gender = selectedGender.value;
  const key = `students${selectedClass}${gender.charAt(0).toUpperCase() + gender.slice(1)}`;
  const list = allStudents[key] || [];

  list.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    nameSelect.appendChild(option);
  });
}



classInput.addEventListener('change', updateNameDropdown);
genderRadios.forEach(radio => radio.addEventListener('change', updateNameDropdown));

// 📥 Load existing data
nameSelect.addEventListener('change', loadExistingData);
dateInput.addEventListener('change', loadExistingData);

function loadExistingData() {
  const name = nameSelect.value;
  const date = dateInput.value;
  if (!name || !date) return;

  const entryRef = ref(database, `prayers/${date}/${name}`);
  get(entryRef).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(id => {
        document.getElementById(id).checked = !!data[id];
      });
    } else {
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(id => {
        document.getElementById(id).checked = false;
      });
    }
  });
}

// ✅ Submit form
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const className = classInput.value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const name = nameSelect.value;
  const date = dateInput.value;

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const score = prayers.reduce((total, id) => total + (document.getElementById(id).checked ? 1 : 0), 0);

  const data = {
    class: className,
    gender,
    score
  };

  prayers.forEach(p => {
    data[p] = document.getElementById(p).checked;
  });

  const entryRef = ref(database, `prayers/${date}/${name}`);
  set(entryRef, data).then(() => {
    alert('🟢 പ്രാർത്ഥന വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു 🟢');
    updateRanking(className);
    showLastWeekTop(className);
    showLastMonthTop(className);
  });
});

// 🔝 Today Rank
function updateRanking(classFilter = '') {
  const today = new Date().toISOString().slice(0, 10);
  const dayRef = ref(database, `prayers/${today}`);

  get(dayRef).then(snapshot => {
    if (!snapshot.exists()) return;
    const data = snapshot.val();
    const scores = {};

    for (const student in data) {
      const entry = data[student];
      if (!classFilter || entry.class === classFilter) {
        scores[student] = entry.score || 0;
      }
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 10);
    rankList.innerHTML = '';

    sorted.forEach(([name, score], index) => {
      const li = document.createElement('li');
      rankList.appendChild(li);

      let icon = ['🏆', '🥈', '🥉'][index] || '🔹';
      const fullText = `${icon} ${name} - ${score} മാർക്ക്`;
      let i = 0;

      function typeChar() {
        if (i <= fullText.length) {
          li.textContent = fullText.slice(0, i++);
          setTimeout(typeChar, 30);
        }
      }

      setTimeout(typeChar, index * 200);
    });
  });
}

// 🗓 Last Week / Month
function showLastWeekTop(classFilter = '') {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
  getTopPerformers(dates, 5, 'weekRankList', classFilter);
}

function showLastMonthTop(classFilter = '') {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
  getTopPerformers(dates, 7, 'monthRankList', classFilter);
}

function getTopPerformers(dates, topN, elementId, classFilter = '') {
  const rootRef = ref(database, 'prayers');
  get(rootRef).then(snapshot => {
    if (!snapshot.exists()) return;
    const data = snapshot.val();
    const scores = {};

    dates.forEach(date => {
      if (data[date]) {
        for (const name in data[date]) {
          const entry = data[date][name];
          if (!classFilter || entry.class === classFilter) {
            scores[name] = (scores[name] || 0) + (entry.score || 0);
          }
        }
      }
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, topN);
    const rankList = document.getElementById(elementId);
    rankList.innerHTML = '';

    sorted.forEach(([name, score], index) => {
      const li = document.createElement('li');
      rankList.appendChild(li);
      let icon = ['🏆', '🥈', '🥉'][index] || '🔹';
      const fullText = `${icon} ${name} - ${score} മാർക്ക്`;
      let i = 0;

      function typeChar() {
        if (i <= fullText.length) {
          li.textContent = fullText.slice(0, i++);
          setTimeout(typeChar, 20);
        }
      }

      setTimeout(typeChar, index * 500);
    });
  });
}

// 🟢 Initial load
window.addEventListener('DOMContentLoaded', () => {
  const selectedClass = classInput.value;
  updateNameDropdown();
  updateRanking(selectedClass);
  showLastWeekTop(selectedClass);
  showLastMonthTop(selectedClass);
});
