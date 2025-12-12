/* ---------- Loader ---------- */
window.addEventListener('load', () => {
  setTimeout(()=> document.getElementById('loader').style.display = 'none', 450);
});

/* ---------- Menu / Scroll ---------- */
const menu = document.getElementById('menu');
const menuItems = document.querySelectorAll('.menu-item');
const cards = document.querySelectorAll('.card');
const sections = document.querySelectorAll('main .section');
const menuToggle = document.getElementById('menuToggle');

function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  if(menu.classList.contains('open')) menu.classList.remove('open');
  el.scrollIntoView({behavior: 'smooth', block: 'start'});
}

menuItems.forEach(mi => {
  mi.addEventListener('click', () => {
    scrollToSection(mi.dataset.target);
  });
});

cards.forEach(card => {
  card.addEventListener('click', () => {
    scrollToSection(card.dataset.target);
  });
});

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('open');
});

/* ---------- Active Menu Highlight ---------- */
const observerOptions = { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const activeItem = document.querySelector(`.menu-item[data-target="${id}"]`);
    if(entry.isIntersecting){
      menuItems.forEach(mi => mi.classList.remove('active'));
      if(activeItem) activeItem.classList.add('active');
    }
  });
}, observerOptions);

sections.forEach(sec => io.observe(sec));

/* ---------- Theme toggle ---------- */
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

/* ---------- EMI Calculator ---------- */
document.getElementById('calcEmi').addEventListener('click', function(){
  const P = +document.getElementById('loanAmount').value;
  const r = +document.getElementById('loanRate').value/1200;
  const n = +document.getElementById('loanYears').value*12;
  const out = document.getElementById('emiResult');
  if(!P || !r || !n) return out.textContent = 'Enter valid inputs.';
  const emi = (P * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
  out.textContent = `Monthly EMI: ₹${emi.toFixed(2)}`;
});

/* ---------- Compound Interest ---------- */
document.getElementById('calcCompound').addEventListener('click', function(){
  const P = +document.getElementById('principal').value;
  const r = +document.getElementById('interestRate').value/100;
  const t = +document.getElementById('years').value;
  const out = document.getElementById('compoundResult');
  if(!P || !r || !t) return out.textContent = 'Enter valid inputs.';
  const A = P * Math.pow(1+r, t);
  out.textContent = `Future Value: ₹${A.toFixed(2)}`;
});

/* ---------- Retirement Corpus ---------- */
document.getElementById('calcRetire').addEventListener('click', function(){
  const m = +document.getElementById('retireMonthly').value;
  const yrs = +document.getElementById('retireYears').value;
  const r = +document.getElementById('retireRate').value/1200;
  const out = document.getElementById('retirementResult');
  if(!m || !yrs || !r) return out.textContent = 'Enter valid inputs.';
  const months = yrs * 12;
  const corpus = m * ((Math.pow(1+r, months)-1)/r);
  out.textContent = `Estimated Corpus: ₹${corpus.toFixed(2)}`;
});

/* ---------- TAX CALCULATOR (NO HISTORY) ---------- */

const taxRegimes = {
  "Old-2022-23": [
    { upto: 300000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 750000, rate: 0.1 },
    { upto: 1000000, rate: 0.15 },
    { upto: 1250000, rate: 0.2 },
    { upto: 1500000, rate: 0.25 },
    { upto: null, rate: 0.3 }
  ],
  "Old-2023-24": [
    { upto: 300000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 750000, rate: 0.1 },
    { upto: 1000000, rate: 0.15 },
    { upto: 1250000, rate: 0.2 },
    { upto: 1500000, rate: 0.25 },
    { upto: null, rate: 0.3 }
  ],
  "New-2023-24": [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 750000, rate: 0.1 },
    { upto: 1000000, rate: 0.15 },
    { upto: 1250000, rate: 0.2 },
    { upto: 1500000, rate: 0.25 },
    { upto: null, rate: 0.3 }
  ],
  "New-2024-25": [
    { upto: 300000, rate: 0 },
    { upto: 700000, rate: 0.05 },
    { upto: 1000000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: null, rate: 0.3 }
  ]
};

const CESS = 0.04;

function computeProgressiveTax(income, slabs){
  let tax = 0, lower = 0;
  for(let slab of slabs){
    if(slab.upto === null){
      if(income > lower) tax += (income - lower) * slab.rate;
      break;
    }
    if(income > lower){
      const taxable = Math.min(income, slab.upto) - lower;
      if(taxable > 0) tax += taxable * slab.rate;
    }
    if(income <= slab.upto) break;
    lower = slab.upto;
  }
  return tax;
}

const regimeSelect = document.getElementById('regimeSelect');
const taxIncome = document.getElementById('taxIncome');
const taxResult = document.getElementById('taxResult');

document.getElementById('calcTax').addEventListener('click', ()=>{
  const income = +taxIncome.value;
  const regime = regimeSelect.value;
  taxResult.textContent = '';

  if(!income || income <= 0){
    return taxResult.textContent = 'Enter a valid income amount.';
  }

  const slabs = taxRegimes[regime];
  const baseTax = computeProgressiveTax(income, slabs);
  const cess = baseTax * CESS;
  const totalTax = baseTax + cess;

  function commas(x){ return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  taxResult.innerHTML =
    `Estimated Tax: <strong>₹${commas(totalTax.toFixed(2))}</strong>
     <div class="muted small">(Base: ₹${commas(baseTax.toFixed(2))} + Cess: ₹${commas(cess.toFixed(2))})</div>`;
});
