// copyMoveLogs.js

/**
 * Selects and copies the content of the moveLogs textarea.
 * Provides visual feedback on the button upon successful copy.
 */
function copyMoveLogs(event) {
  const logs = document.getElementById('moveLogs');
  if (!logs) return;

  // Get the element that triggered the function (likely a button)
  const triggerBtn = event ? event.target : null;

  // ---------- 1. SELECT ALL CONTENTS (FOR VISUAL FEEDBACK / MANUAL COPY) ----------
  // For <textarea> or <input>
  if (logs.tagName === 'TEXTAREA' || logs.tagName === 'INPUT') {
    logs.focus();
    logs.select();
    logs.setSelectionRange(0, 99999); // mobile
  }
  // For <div>, <pre>, etc. – use Range selection
  else {
    const range = document.createRange();
    range.selectNodeContents(logs);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ---------- 2. GET TEXT ONLY (what we actually copy) ----------
  const textToCopy = logs.value || logs.textContent || logs.innerText || '';

  // ---------- 3. COPY (modern + fallback) ----------
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern Approach: Copy the text variable directly
    navigator.clipboard.writeText(textToCopy)
      .then(() => showCopiedFeedback(triggerBtn))
      .catch(() => fallbackCopy(textToCopy, triggerBtn));
  } else {
    // Fallback if modern API isn't available
    fallbackCopy(textToCopy, triggerBtn);
  }
}

// --- Fallback: execCommand (Deprecated but useful for older browsers) ---
function fallbackCopy(text, triggerBtn) {
  let temp;
  try {
    // Create temporary textarea to copy clean text
    temp = document.createElement('textarea');
    temp.value = text;
    // Style to hide it off-screen
    temp.style.position = 'fixed';
    temp.style.top = '0';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    
    // Select the content of the temporary element
    temp.focus();
    temp.select();
    temp.setSelectionRange(0, 99999); // Mobile compatibility

    const success = document.execCommand('copy');
    
    if (success) {
      showCopiedFeedback(triggerBtn);
    } else {
      alert('Copy failed – please select and copy manually.');
    }
  } catch (err) {
    alert('Copy failed – your browser may block it.');
  } finally {
    // Clean up the temporary element
    if (temp) {
      document.body.removeChild(temp);
    }
  }
}

// ---------- Visual feedback (Pass the button element) ----------
function showCopiedFeedback(btn) {
  if (!btn) return;
  const oldText = btn.innerText;
  const oldBg = btn.style.backgroundColor;
  const oldColor = btn.style.color;

  btn.innerText = 'Copied!';
  btn.style.backgroundColor = '#4CAF50';
  btn.style.color = 'white';
  
  setTimeout(() => {
    btn.innerText = oldText;
    btn.style.backgroundColor = oldBg;
    btn.style.color = oldColor;
  }, 1500);
}

