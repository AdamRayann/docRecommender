const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const actions = document.getElementById('actions');
const loader = document.getElementById('loader');
const fileLabel = document.getElementById('file-label');
const responseBox = document.getElementById('response-box');
const downloadBtn = document.getElementById('download-btn');

let selectedFile = null;

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  handleFile(file);
});

document.getElementById('remove-btn').addEventListener('click', () => {
  selectedFile = null;
  fileLabel.textContent = 'Drag and drop your .docx file here';
  actions.classList.add('hidden');
  responseBox.textContent = '';
  responseBox.classList.add('hidden');
  downloadBtn.classList.add('hidden');
});

document.getElementById('analyze-btn').addEventListener('click', () => {
  if (!selectedFile) return;

  loader.classList.remove('hidden');
  responseBox.classList.add('hidden');
  responseBox.textContent = '';
  downloadBtn.classList.add('hidden');

  const formData = new FormData();
  formData.append('file', selectedFile);

  fetch('https://docrecommenderbackend.onrender.com/analyze', {
    method: 'POST',
    body: formData,
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      return data;
    })
    .then(data => {
      console.log('✅ Response:', data);
      responseBox.innerHTML = marked.parse(data.text || 'אין תגובה מהשרת');
      responseBox.classList.remove('hidden');
      downloadBtn.classList.remove('hidden');
      responseBox.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(err => {
      console.error('❌ Error:', err);
      responseBox.textContent = '❌ ' + err.message;
      responseBox.classList.remove('hidden');
    })
    .finally(() => {
      loader.classList.add('hidden');
    });
});

downloadBtn.addEventListener('click', () => {
  const clone = document.createElement('div');
  clone.innerHTML = responseBox.innerHTML;

  // Apply styling
  clone.style.fontFamily = "'Rubik', Arial, sans-serif";
  clone.style.direction = 'rtl';
  clone.style.textAlign = 'right';
  clone.style.padding = '1cm';
  clone.style.width = '210mm'; // A4 width
  clone.style.boxSizing = 'border-box';
  clone.style.overflowWrap = 'break-word';
  clone.style.wordBreak = 'break-word';

  // Force list rendering properly
  const lists = clone.querySelectorAll('ol, ul');
  lists.forEach(list => {
    list.style.direction = 'rtl';
    list.style.textAlign = 'right';
  });

  const options = {
    filename: 'ai_analysis.pdf',
    margin: 0,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(options).from(clone).save();
});


function handleFile(file) {
  if (file && file.name.endsWith('.docx')) {
    selectedFile = file;
    fileLabel.textContent = file.name;
    actions.classList.remove('hidden');
  }
}
