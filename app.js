document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // UI Elements Selection
    // ==========================================================================
    const themeToggle = document.getElementById('themeToggle');
    const rawInput = document.getElementById('rawInput');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    // Filters & Options
    const filterGmailOnly = document.getElementById('filterGmailOnly');
    const filterAllEmails = document.getElementById('filterAllEmails');
    const optAutocorrect = document.getElementById('optAutocorrect');
    const optDeduplicate = document.getElementById('optDeduplicate');
    const optSort = document.getElementById('optSort');
    const optLowercase = document.getElementById('optLowercase');
    const btnProcess = document.getElementById('btnProcess');
    
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const emailBadgeCount = document.getElementById('emailBadgeCount');
    const phoneBadgeCount = document.getElementById('phoneBadgeCount');
    
    // Email Outputs & Stats
    const statEmailValid = document.getElementById('statEmailValid');
    const statEmailCorrected = document.getElementById('statEmailCorrected');
    const statEmailWrong = document.getElementById('statEmailWrong');
    const statEmailWrongContainer = document.getElementById('statEmailWrongContainer');
    const statEmailInvalid = document.getElementById('statEmailInvalid');
    const emailOutput = document.getElementById('emailOutput');
    const emailCorrectedSection = document.getElementById('emailCorrectedSection');
    const emailCorrectedCount = document.getElementById('emailCorrectedCount');
    const emailCorrectedTableBody = document.getElementById('emailCorrectedTableBody');
    const emailInvalidSection = document.getElementById('emailInvalidSection');
    const emailInvalidCount = document.getElementById('emailInvalidCount');
    const emailInvalidList = document.getElementById('emailInvalidList');
    
    // Phone Outputs & Stats
    const statPhoneValid = document.getElementById('statPhoneValid');
    const statPhoneCorrected = document.getElementById('statPhoneCorrected');
    const statPhoneInvalid = document.getElementById('statPhoneInvalid');
    const statPhoneDuplicate = document.getElementById('statPhoneDuplicate');
    const statPhoneDupCard = document.getElementById('statPhoneDupCard');
    const phoneDupBanner = document.getElementById('phoneDupBanner');
    const dupCountText = document.getElementById('dupCountText');
    const btnDeduplicateQuick = document.getElementById('btnDeduplicateQuick');
    const phoneOutput = document.getElementById('phoneOutput');
    const phoneDupSection = document.getElementById('phoneDupSection');
    const phoneDupListCount = document.getElementById('phoneDupListCount');
    const phoneDupList = document.getElementById('phoneDupList');
    const phoneCorrectedSection = document.getElementById('phoneCorrectedSection');
    const phoneCorrectedCount = document.getElementById('phoneCorrectedCount');
    const phoneCorrectedTableBody = document.getElementById('phoneCorrectedTableBody');
    const phoneInvalidSection = document.getElementById('phoneInvalidSection');
    const phoneInvalidCount = document.getElementById('phoneInvalidCount');
    const phoneInvalidList = document.getElementById('phoneInvalidList');
    
    // Downloads & Copy
    const copyButtons = document.querySelectorAll('.copy-btn');
    const downloadEmailTxt = document.getElementById('downloadEmailTxt');
    const downloadEmailCsv = document.getElementById('downloadEmailCsv');
    const downloadPhoneTxt = document.getElementById('downloadPhoneTxt');
    const downloadPhoneCsv = document.getElementById('downloadPhoneCsv');
    
    // Toast
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // State Variables
    let processedEmails = [];
    let processedPhones = [];

    // ==========================================================================
    // Theme Management (Light/Dark Mode)
    // ==========================================================================
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ==========================================================================
    // Collapsible Sections Management
    // ==========================================================================
    document.querySelectorAll('.collapse-header').forEach(header => {
        header.addEventListener('click', () => {
            const container = header.parentElement;
            container.classList.toggle('open');
        });
    });

    // ==========================================================================
    // Tab Management
    // ==========================================================================
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetTab = button.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // ==========================================================================
    // Drag and Drop & File Upload
    // ==========================================================================
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });
    
    function handleUploadedFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            rawInput.value = event.target.result;
            showToast(`Đã tải lên tệp: ${file.name}`);
            processData();
        };
        reader.readAsText(file);
    }

    // ==========================================================================
    // Notification Toast Helper
    // ==========================================================================
    function showToast(message, isError = false) {
        toastMsg.textContent = message;
        if (isError) {
            toast.style.borderColor = 'var(--danger-border)';
            toast.style.color = 'var(--danger-color)';
        } else {
            toast.style.borderColor = 'var(--success-border)';
            toast.style.color = 'var(--success-color)';
        }
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==========================================================================
    // Normalization Helpers & Algorithms
    // ==========================================================================
    
    // Remove Vietnamese Accent marks
    function removeVietnameseTones(str) {
        let result = str;
        result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        result = result.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        result = result.replace(/đ/g, "d");
        result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        result = result.replace(/Đ/g, "D");
        return result;
    }

    // Preprocess spaces inside email candidates
    function preprocessEmailSpaces(text) {
        // 1. Remove spaces around '@'
        let cleaned = text.replace(/\s*@\s*/g, '@');
        // 2. Remove spaces and dots inside the domain part (e.g. . . com -> .com)
        cleaned = cleaned.replace(/@([a-zA-Z0-9\-\s\.]+)/g, (match, domainPart) => {
            // Remove all spaces, then merge multiple dots
            return '@' + domainPart.replace(/\s+/g, '').replace(/\.+/g, '.');
        });
        return cleaned;
    }

    // Email Auto-Correction and Validation
    function normalizeEmail(emailStr, autocorrectEnabled) {
        let original = emailStr.trim();
        let email = original;
        let corrected = false;
        let reasons = [];

        if (autocorrectEnabled) {
            // Remove spaces inside the string (e.g. user @ gmail .com -> user@gmail.com)
            const noSpaces = email.replace(/\s+/g, '');
            if (noSpaces !== email) {
                email = noSpaces;
                corrected = true;
                reasons.push("Loại bỏ khoảng trắng");
            }

            // Split into local and domain part
            const atIndex = email.lastIndexOf('@');
            if (atIndex > 0) {
                let localPart = email.slice(0, atIndex);
                let domainPart = email.slice(atIndex + 1);

                // 1. Correct Vietnamese accents in localPart
                const unaccentedLocal = removeVietnameseTones(localPart);
                if (unaccentedLocal !== localPart) {
                    localPart = unaccentedLocal;
                    corrected = true;
                    reasons.push("Loại bỏ dấu tiếng Việt");
                }

                // 2. Correct domain typos
                let lowerDomain = domainPart.toLowerCase();
                
                // Remove Vietnamese tones from domain (e.g. cơm -> com)
                const unaccentedDomain = removeVietnameseTones(lowerDomain);
                if (unaccentedDomain !== lowerDomain) {
                    lowerDomain = unaccentedDomain;
                    corrected = true;
                    reasons.push("Sửa dấu tiếng Việt ở tên miền");
                }

                // If it starts with gmail or matches a gmail typo, map to gmail.com
                const gmailTypoPattern = /^(g[amyei]+l[a-z0-9]*)[._-]?(c[o0][m|n|o]|co|net|com\.vn|co\.vn)?$/i;
                const looksLikeGmail = lowerDomain.startsWith('gmail') || 
                                       gmailTypoPattern.test(lowerDomain) || 
                                       lowerDomain.includes('gamil') || 
                                       lowerDomain.includes('gmal') ||
                                       lowerDomain === 'googlemail.com';

                if (looksLikeGmail) {
                    if (lowerDomain !== 'gmail.com') {
                        domainPart = 'gmail.com';
                        corrected = true;
                        reasons.push("Đưa về tên miền chuẩn gmail.com");
                    } else {
                        domainPart = 'gmail.com';
                    }
                } else {
                    // For non-Gmail domains, handle trailing Vietnamese words or invalid text (e.g. yahoo.com.mình -> yahoo.com)
                    const validSubTlds = ['vn', 'tw', 'cn', 'sg', 'hk', 'my', 'ph', 'id', 'th', 'jp', 'kr', 'us', 'uk', 'au', 'ca'];
                    const match = lowerDomain.match(/\.com\.([a-z0-9]+)$/i);
                    if (match) {
                        const suffix = match[1];
                        if (!validSubTlds.includes(suffix)) {
                            lowerDomain = lowerDomain.slice(0, -match[0].length) + '.com';
                            domainPart = lowerDomain;
                            corrected = true;
                            reasons.push(`Loại bỏ hậu tố thừa .${suffix}`);
                        }
                    }
                }

                email = `${localPart}@${domainPart}`;
            }
        }

        // Validate syntax
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = emailRegex.test(email);

        return {
            original,
            email,
            corrected: corrected && (original !== email),
            reasons: reasons.join(', '),
            isValid
        };
    }

    // Phone Number Normalization and Validation
    function normalizePhone(phoneStr, autocorrectEnabled) {
        let original = phoneStr.trim();
        let normalized = original;
        let corrected = false;
        let reasons = [];

        // Check if there are formatting characters (spaces, dots, hyphens, brackets)
        const cleanedNoSpecial = original.replace(/[\s\.\-\(\)]/g, '');
        if (cleanedNoSpecial !== original && autocorrectEnabled) {
            normalized = cleanedNoSpecial;
            corrected = true;
            reasons.push("Loại bỏ ký tự phân cách");
        } else {
            normalized = original.replace(/[^\d+]/g, ''); // keep only digits and +
        }

        if (autocorrectEnabled) {
            // Normalize country code +84 or 84
            if (normalized.startsWith('+84')) {
                normalized = '0' + normalized.slice(3);
                corrected = true;
                reasons.push("Chuyển mã quốc gia +84 thành 0");
            } else if (normalized.startsWith('84') && normalized.length === 11) {
                normalized = '0' + normalized.slice(2);
                corrected = true;
                reasons.push("Chuyển mã quốc gia 84 thành 0");
            } else if (/^[35789]\d{8}$/.test(normalized)) {
                // 9-digit number starting with mobile prefixdigit -> prepend 0
                normalized = '0' + normalized;
                corrected = true;
                reasons.push("Sửa thiếu số 0 ở đầu");
            }
        }

        // Carrier Prefixes in Vietnam
        const vnMobilePrefixes = [
            '086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039', // Viettel
            '089', '090', '093', '070', '076', '077', '078', '079', // Mobifone
            '088', '091', '094', '081', '082', '083', '084', '085', // Vinaphone
            '092', '056', '058', // Vietnamobile
            '099', '059', // Gmobile
            '087', '055' // Wintel / Reddi
        ];

        let isValid = false;
        let isLandline = false;

        // Check mobile formatting (10 digits starting with 0 and correct prefix)
        if (normalized.length === 10 && normalized.startsWith('0')) {
            const prefix = normalized.slice(0, 3);
            if (vnMobilePrefixes.includes(prefix)) {
                isValid = true;
            }
        } 
        // Check landline formatting (11 digits starting with 02)
        else if (normalized.length === 11 && normalized.startsWith('02')) {
            isValid = true;
            isLandline = true;
        }

        return {
            original,
            normalized,
            corrected: corrected || (original !== normalized),
            reasons: reasons.join(', '),
            isValid,
            isLandline
        };
    }

    // Strip noise surrounding candidate matches (e.g. dots, commas, parens)
    function stripNoise(str) {
        return str.replace(/^[\s,;:\.()<>\[\]\\"'#%?&*-]+|[\s,;:\.()<>\[\]\\"'#%?&*-]+$/g, '');
    }

    // ==========================================================================
    // Main Processing Controller
    // ==========================================================================
    function processData() {
        let text = rawInput.value;
        if (!text.trim()) {
            showToast("Vui lòng nhập văn bản đầu vào!", true);
            return;
        }

        const emailMode = document.querySelector('input[name="emailFilterMode"]:checked').value;
        const autocorrectEnabled = optAutocorrect.checked;
        const deduplicateEnabled = optDeduplicate.checked;
        const sortEnabled = optSort.checked;
        const lowercaseEnabled = optLowercase.checked;

        // Hide/Show Email Mode specific UI
        if (emailMode === 'all') {
            statEmailWrongContainer.style.display = 'none';
        } else {
            statEmailWrongContainer.style.display = 'flex';
        }

        // Reset output arrays
        processedEmails = [];
        processedPhones = [];

        // ----------------------------------------------------------------------
        // Part 1: Email Processing
        // ----------------------------------------------------------------------
        // Preprocess spaces in email domains first
        let emailPreprocessedText = preprocessEmailSpaces(text);
        
        // Relaxed regex to find email candidates (anything containing @)
        const emailCandidateRegex = /[^\s,;:()<>\[\]]+@[^\s,;:()<>\[\]]+/g;
        let emailMatches = emailPreprocessedText.match(emailCandidateRegex) || [];

        let validEmails = [];
        let correctedEmailsList = [];
        let wrongDomainEmails = [];
        let invalidEmailsList = [];

        emailMatches.forEach(candidate => {
            const cleanCandidate = stripNoise(candidate);
            if (!cleanCandidate) return;

            const res = normalizeEmail(cleanCandidate, autocorrectEnabled);
            
            // Check lowercase setting
            if (lowercaseEnabled) {
                res.email = res.email.toLowerCase();
            }

            if (!res.isValid) {
                invalidEmailsList.push(res);
            } else {
                // If it is valid email structure
                const isGmail = res.email.toLowerCase().endsWith('@gmail.com');
                
                if (emailMode === 'gmail' && !isGmail) {
                    wrongDomainEmails.push(res);
                } else {
                    if (res.corrected) {
                        correctedEmailsList.push(res);
                    }
                    validEmails.push(res);
                }
            }
        });

        // ----------------------------------------------------------------------
        // Part 2: Phone Number Processing
        // ----------------------------------------------------------------------
        // Regex to match phone candidates (starts with +84, 84, 0 or word boundary di động and has digits/formatting)
        const phoneCandidateRegex = /(?:\+?84|0|\b[35789])(?:\s*[\.\-\(\)]*\s*\d){8,11}\b/g;
        let phoneMatches = text.match(phoneCandidateRegex) || [];

        let validPhones = [];
        let correctedPhonesList = [];
        let invalidPhonesList = [];
        let phoneCounts = {}; // To track duplicates

        phoneMatches.forEach(candidate => {
            const cleanCandidate = stripNoise(candidate);
            if (!cleanCandidate || cleanCandidate.length < 7) return; // ignore very short matches

            const res = normalizePhone(cleanCandidate, autocorrectEnabled);

            if (!res.isValid) {
                invalidPhonesList.push(res);
            } else {
                // Store phone
                if (res.corrected) {
                    correctedPhonesList.push(res);
                }
                validPhones.push(res);
                
                // Track frequency
                phoneCounts[res.normalized] = (phoneCounts[res.normalized] || 0) + 1;
            }
        });

        // Calculate duplicate statistics
        let dupPhoneCount = 0;
        let duplicatePhonesDetails = [];
        Object.keys(phoneCounts).forEach(num => {
            if (phoneCounts[num] > 1) {
                dupPhoneCount += (phoneCounts[num] - 1);
                duplicatePhonesDetails.push({
                    number: num,
                    count: phoneCounts[num]
                });
            }
        });

        // ----------------------------------------------------------------------
        // Deduplication & Sorting
        // ----------------------------------------------------------------------
        
        // Handle Email Deduplication
        let finalEmails = validEmails.map(item => item.email);
        if (deduplicateEnabled) {
            finalEmails = [...new Set(finalEmails)];
        }
        if (sortEnabled) {
            finalEmails.sort((a, b) => a.localeCompare(b));
        }

        // Handle Phone Deduplication
        let finalPhones = validPhones.map(item => item.normalized);
        if (deduplicateEnabled) {
            finalPhones = [...new Set(finalPhones)];
        }
        if (sortEnabled) {
            finalPhones.sort((a, b) => a.localeCompare(b));
        }

        // Save states
        processedEmails = finalEmails;
        processedPhones = finalPhones;

        // ==========================================================================
        // Render Results to UI
        // ==========================================================================
        
        // Render Email Tab
        emailBadgeCount.textContent = finalEmails.length;
        statEmailValid.textContent = validEmails.filter(x => !x.corrected).length;
        statEmailCorrected.textContent = correctedEmailsList.length;
        statEmailWrong.textContent = wrongDomainEmails.length;
        statEmailInvalid.textContent = invalidEmailsList.length;
        emailOutput.value = finalEmails.join('\n');

        // Email Corrected Table
        if (correctedEmailsList.length > 0) {
            emailCorrectedSection.style.display = 'block';
            emailCorrectedCount.textContent = correctedEmailsList.length;
            emailCorrectedTableBody.innerHTML = correctedEmailsList.map(item => `
                <tr>
                    <td>${escapeHtml(item.original)}</td>
                    <td>${escapeHtml(item.email)}</td>
                    <td><span class="reason-badge">${escapeHtml(item.reasons)}</span></td>
                </tr>
            `).join('');
        } else {
            emailCorrectedSection.style.display = 'none';
        }

        // Email Invalid List
        if (invalidEmailsList.length > 0) {
            emailInvalidSection.style.display = 'block';
            emailInvalidCount.textContent = invalidEmailsList.length;
            emailInvalidList.innerHTML = invalidEmailsList.map(item => `
                <li>${escapeHtml(item.original)}</li>
            `).join('');
        } else {
            emailInvalidSection.style.display = 'none';
        }

        // Render Phone Tab
        phoneBadgeCount.textContent = finalPhones.length;
        statPhoneValid.textContent = validPhones.filter(x => !x.corrected).length;
        statPhoneCorrected.textContent = correctedPhonesList.length;
        statPhoneInvalid.textContent = invalidPhonesList.length;
        statPhoneDuplicate.textContent = dupPhoneCount;
        phoneOutput.value = finalPhones.join('\n');

        // Duplicate Warning Banner & Card Accent
        if (dupPhoneCount > 0) {
            statPhoneDupCard.style.borderColor = 'var(--warning-accent-border)';
            statPhoneDupCard.style.color = 'var(--warning-accent-color)';
            
            // Only show banner if Deduplication is currently disabled
            if (!deduplicateEnabled) {
                phoneDupBanner.style.display = 'flex';
                dupCountText.textContent = dupPhoneCount;
            } else {
                phoneDupBanner.style.display = 'none';
            }
        } else {
            statPhoneDupCard.style.borderColor = 'transparent';
            statPhoneDupCard.style.color = 'var(--text-secondary)';
            phoneDupBanner.style.display = 'none';
        }

        // Phone Duplicate Details List
        if (duplicatePhonesDetails.length > 0) {
            phoneDupSection.style.display = 'block';
            phoneDupListCount.textContent = duplicatePhonesDetails.length;
            phoneDupList.innerHTML = duplicatePhonesDetails.map(item => `
                <li>
                    <span>${escapeHtml(item.number)}</span>
                    <span class="dup-badge">Lặp lại ${item.count} lần</span>
                </li>
            `).join('');
        } else {
            phoneDupSection.style.display = 'none';
        }

        // Phone Corrected Table
        if (correctedPhonesList.length > 0) {
            phoneCorrectedSection.style.display = 'block';
            phoneCorrectedCount.textContent = correctedPhonesList.length;
            phoneCorrectedTableBody.innerHTML = correctedPhonesList.map(item => `
                <tr>
                    <td>${escapeHtml(item.original)}</td>
                    <td>${escapeHtml(item.normalized)}</td>
                    <td><span class="reason-badge">${escapeHtml(item.reasons)}</span></td>
                </tr>
            `).join('');
        } else {
            phoneCorrectedSection.style.display = 'none';
        }

        // Phone Invalid List
        if (invalidPhonesList.length > 0) {
            phoneInvalidSection.style.display = 'block';
            phoneInvalidCount.textContent = invalidPhonesList.length;
            phoneInvalidList.innerHTML = invalidPhonesList.map(item => `
                <li>${escapeHtml(item.original)}</li>
            `).join('');
        } else {
            phoneInvalidSection.style.display = 'none';
        }

        showToast("Đã trích xuất và chuẩn hóa dữ liệu thành công!");
    }

    // Helper to escape HTML tags to prevent XSS in dynamic list
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // ==========================================================================
    // Event Listeners for Process & Actions
    // ==========================================================================
    btnProcess.addEventListener('click', processData);

    // Quick Deduplicate action from Phone warning banner
    btnDeduplicateQuick.addEventListener('click', () => {
        optDeduplicate.checked = true;
        processData();
    });

    // Copy to Clipboard Action
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const textarea = document.getElementById(targetId);
            
            if (!textarea.value) {
                showToast("Không có dữ liệu để sao chép!", true);
                return;
            }

            textarea.select();
            navigator.clipboard.writeText(textarea.value)
                .then(() => {
                    showToast("Đã sao chép danh sách vào clipboard!");
                })
                .catch(err => {
                    console.error("Lỗi khi copy: ", err);
                    showToast("Không thể copy tự động!", true);
                });
        });
    });

    // ==========================================================================
    // Export File Actions
    // ==========================================================================
    
    // Download TXT helper
    function downloadTxtFile(dataArr, filename) {
        if (dataArr.length === 0) {
            showToast("Không có dữ liệu để tải xuống!", true);
            return;
        }
        const blob = new Blob([dataArr.join('\n')], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`Đã tải xuống tệp: ${filename}`);
    }

    // Download CSV helper
    function downloadCsvFile(dataArr, header, filename) {
        if (dataArr.length === 0) {
            showToast("Không có dữ liệu để tải xuống!", true);
            return;
        }
        // BOM for Excel Vietnamese characters display
        const BOM = '\uFEFF';
        const csvContent = BOM + header + '\n' + dataArr.map(x => `"${x}"`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`Đã tải xuống tệp: ${filename}`);
    }

    downloadEmailTxt.addEventListener('click', () => {
        downloadTxtFile(processedEmails, 'gmail_extractor_results.txt');
    });

    downloadEmailCsv.addEventListener('click', () => {
        const mode = document.querySelector('input[name="emailFilterMode"]:checked').value;
        const header = mode === 'gmail' ? 'Gmail Address' : 'Email Address';
        downloadCsvFile(processedEmails, header, 'gmail_extractor_results.csv');
    });

    downloadPhoneTxt.addEventListener('click', () => {
        downloadTxtFile(processedPhones, 'phone_extractor_results.txt');
    });

    downloadPhoneCsv.addEventListener('click', () => {
        downloadCsvFile(processedPhones, 'Phone Number', 'phone_extractor_results.csv');
    });
});
