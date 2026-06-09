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
    const downloadExcel = document.getElementById('downloadExcel');
    
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
        const fileName = file.name;
        const fileExt = fileName.split('.').pop().toLowerCase();
        const reader = new FileReader();

        if (fileExt === 'xlsx' || fileExt === 'xls') {
            // Excel file parsing using SheetJS
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    let combinedText = [];
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        // Convert sheet to CSV format
                        const csv = XLSX.utils.sheet_to_csv(worksheet);
                        if (csv.trim()) {
                            combinedText.push(csv);
                        }
                    });
                    
                    rawInput.value = combinedText.join('\n');
                    showToast(`Đã tải lên và đọc tệp Excel: ${fileName}`);
                    processData();
                } catch (err) {
                    console.error("Lỗi đọc Excel: ", err);
                    showToast("Không thể đọc tệp Excel này!", true);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Text files (.txt, .csv, .json, etc.)
            reader.onload = (event) => {
                rawInput.value = event.target.result;
                showToast(`Đã tải lên tệp văn bản: ${fileName}`);
                processData();
            };
            reader.readAsText(file);
        }
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

    // Capitalize first letter of each word in the name
    function capitalizeName(nameStr) {
        return nameStr
            .split(/\s+/)
            .map(word => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
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
                    // For non-Gmail domains, handle typos:
                    const validCountryCodes = ['vn', 'tw', 'cn', 'sg', 'hk', 'my', 'ph', 'id', 'th', 'jp', 'kr', 'us', 'uk', 'au', 'ca'];
                    
                    // 1. Handle missing dot (e.g. comvn -> com.vn, comxyz -> com)
                    const comTextMatch = lowerDomain.match(/com([a-z0-9]+)$/i);
                    if (comTextMatch) {
                        const suffix = comTextMatch[1];
                        if (validCountryCodes.includes(suffix)) {
                            lowerDomain = lowerDomain.slice(0, -comTextMatch[0].length) + 'com.' + suffix;
                            corrected = true;
                            reasons.push(`Sửa thiếu dấu chấm trước .${suffix}`);
                        } else {
                            lowerDomain = lowerDomain.slice(0, -comTextMatch[0].length) + 'com';
                            corrected = true;
                            reasons.push(`Loại bỏ phần thừa ${suffix} sau com`);
                        }
                    }

                    // 2. Handle trailing noise after country code (e.g. .com.vn.mình -> .com.vn)
                    const matchVn = lowerDomain.match(/\.com\.vn\.([a-z0-9]+)$/i);
                    if (matchVn) {
                        const suffix = matchVn[1];
                        lowerDomain = lowerDomain.slice(0, -matchVn[0].length) + '.com.vn';
                        corrected = true;
                        reasons.push(`Loại bỏ phần thừa .${suffix} sau .vn`);
                    }

                    // 3. Handle trailing noise after com (e.g. .com.mình -> .com)
                    const matchCom = lowerDomain.match(/\.com\.([a-z0-9]+)$/i);
                    if (matchCom) {
                        const suffix = matchCom[1];
                        if (!validCountryCodes.includes(suffix)) {
                            lowerDomain = lowerDomain.slice(0, -matchCom[0].length) + '.com';
                            corrected = true;
                            reasons.push(`Loại bỏ hậu tố thừa .${suffix}`);
                        }
                    }
                    
                    domainPart = lowerDomain;
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

            // Convert old 11-digit mobile prefixes to new 10-digit prefixes
            if (normalized.length === 11) {
                const oldPrefix = normalized.slice(0, 4);
                const mapping = {
                    '0162': '032', '0163': '033', '0164': '034', '0165': '035',
                    '0166': '036', '0167': '037', '0168': '038', '0169': '039',
                    '0120': '070', '0121': '079', '0122': '077', '0126': '076', '0128': '078',
                    '0123': '083', '0124': '084', '0125': '085', '0127': '081', '0129': '082',
                    '0186': '056', '0188': '058',
                    '0199': '059'
                };
                if (mapping[oldPrefix]) {
                    normalized = mapping[oldPrefix] + normalized.slice(4);
                    corrected = true;
                    reasons.push(`Chuyển đổi số di động 11 số cũ (${oldPrefix} -> ${mapping[oldPrefix]})`);
                }
            }
        }

        // Check validation rules:
        // A phone number is considered valid if:
        // - It starts with '0' and has a length between 9 and 11
        // - It starts with a valid mobile prefix (03, 05, 07, 08, 09) OR landline prefix (02)
        let isValid = false;
        let isLandline = false;

        if (normalized.startsWith('0') && normalized.length >= 9 && normalized.length <= 11) {
            const prefix2 = normalized.slice(0, 2);
            const isMobilePrefix = ['03', '05', '07', '08', '09'].includes(prefix2);
            const isLandlinePrefix = prefix2 === '02';

            if (isMobilePrefix) {
                isValid = true;
            } else if (isLandlinePrefix && normalized.length === 11) {
                isValid = true;
                isLandline = true;
            }
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

        // Reset output arrays and tables
        processedEmails = [];
        processedPhones = [];
        processedCustomers = [];

        let validEmails = [];
        let correctedEmailsList = [];
        let wrongDomainEmails = [];
        let invalidEmailsList = [];

        let validPhones = [];
        let correctedPhonesList = [];
        let invalidPhonesList = [];
        let phoneCounts = {};

        let customers = [];

        // Split raw text into lines to process each line as a customer record
        let lines = text.split(/\r?\n/);

        // Date patterns to filter out
        const datePatterns = [
            /\b\d{1,2}[-./]\d{1,2}[-./](?:20|19)\d{2}(?:\s+\d{1,2}(?::\d{2})*)?\b/g, // DD-MM-YYYY HH:MM
            /\b(?:20|19)\d{2}[-./]\d{1,2}[-./]\d{1,2}(?:\s+\d{1,2}(?::\d{2})*)?\b/g, // YYYY-MM-DD HH:MM
            /\b0\d{2}[-./]\d{1,2}[-./]\d{1,2}(?:\s+\d{1,2}(?::\d{2})*)?\b/g          // 026.06.08 19
        ];

        lines.forEach(line => {
            if (!line.trim()) return;

            // 1. Extract first email on this line
            let emailLine = preprocessEmailSpaces(line);
            const emailCandidateRegex = /[^\s,;:()<>\[\]]+@[^\s,;:()<>\[\]]+/i;
            let emailMatch = emailLine.match(emailCandidateRegex);
            let emailVal = null;

            if (emailMatch) {
                const cleanCandidate = stripNoise(emailMatch[0]);
                if (cleanCandidate) {
                    const res = normalizeEmail(cleanCandidate, autocorrectEnabled);
                    if (lowercaseEnabled) {
                        res.email = res.email.toLowerCase();
                    }

                    if (!res.isValid) {
                        invalidEmailsList.push(res);
                    } else {
                        const isGmail = res.email.toLowerCase().endsWith('@gmail.com');
                        if (emailMode === 'gmail' && !isGmail) {
                            wrongDomainEmails.push(res);
                        } else {
                            if (res.corrected) {
                                correctedEmailsList.push(res);
                            }
                            validEmails.push(res);
                            emailVal = res.email;
                        }
                    }
                }
            }

            // 2. Extract first phone on this line
            let phoneLine = line;
            if (autocorrectEnabled) {
                datePatterns.forEach(pattern => {
                    phoneLine = phoneLine.replace(pattern, ' ');
                });
            }

            const phoneCandidateRegex = /(?:\+?84|0|\b[35789])(?:\s*[\.\-\(\)]*\s*\d){8,11}\b/i;
            let phoneMatch = phoneLine.match(phoneCandidateRegex);
            let phoneVal = null;

            if (phoneMatch) {
                const cleanCandidate = stripNoise(phoneMatch[0]);
                if (cleanCandidate && cleanCandidate.length >= 7) {
                    const res = normalizePhone(cleanCandidate, autocorrectEnabled);
                    if (!res.isValid) {
                        invalidPhonesList.push(res);
                    } else {
                        if (res.corrected) {
                            correctedPhonesList.push(res);
                        }
                        validPhones.push(res);
                        phoneVal = res.normalized;
                        phoneCounts[res.normalized] = (phoneCounts[res.normalized] || 0) + 1;
                    }
                }
            }

            // 3. Extract Name if email or phone is found on this line
            const hasEmailMatchObj = emailMatch && emailMatch[0];
            const hasPhoneMatchObj = phoneMatch && phoneMatch[0];
            
            if (emailVal || phoneVal || hasEmailMatchObj || hasPhoneMatchObj) {
                let nameLine = line;
                
                // Remove email text
                if (hasEmailMatchObj) {
                    nameLine = nameLine.replace(emailMatch[0], ' ');
                }
                // Remove phone text
                if (hasPhoneMatchObj) {
                    nameLine = nameLine.replace(phoneMatch[0], ' ');
                }
                // Remove dates
                datePatterns.forEach(pattern => {
                    nameLine = nameLine.replace(pattern, ' ');
                });

                // Clean up punctuation
                nameLine = nameLine.replace(/[:,;\-\|\+\*=~#\(\)\[\]]/g, ' ');
                
                // Remove common labels
                const labelsRegex = /\b(?:khách\s+hàng|khach\s+hang|tên|ten|name|sđt|sdt|phone|email|mail|liên\s+hệ|lien\s+he|lh|đt|dt|số|so|di\s+động|di\s+dong|mobi)\b/gi;
                nameLine = nameLine.replace(labelsRegex, ' ');

                // Remove numbers at start
                nameLine = nameLine.replace(/^\s*\d+\s*[.)\]-]?/g, ' ');

                // Trim and clean spaces
                nameLine = nameLine.replace(/\s+/g, ' ').trim();

                let finalName = "Chưa rõ tên";
                if (nameLine.length >= 2 && !/^[0-9\s.\-_]+$/.test(nameLine)) {
                    finalName = capitalizeName(nameLine);
                }

                customers.push({
                    name: finalName,
                    phone: phoneVal || "Chưa có SĐT",
                    email: emailVal || "Chưa có Email"
                });
            }
        });

        // Calculate duplicate statistics for phones
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
        
        // Handle Email list deduplication/sorting
        let finalEmails = validEmails.map(item => item.email);
        if (deduplicateEnabled) {
            finalEmails = [...new Set(finalEmails)];
        }
        if (sortEnabled) {
            finalEmails.sort((a, b) => a.localeCompare(b));
        }

        // Handle Phone list deduplication/sorting
        let finalPhones = validPhones.map(item => item.normalized);
        if (deduplicateEnabled) {
            finalPhones = [...new Set(finalPhones)];
        }
        if (sortEnabled) {
            finalPhones.sort((a, b) => a.localeCompare(b));
        }

        // Handle Customer list deduplication/sorting
        if (deduplicateEnabled) {
            let seen = new Set();
            customers = customers.filter(c => {
                let key = `${c.name.toLowerCase()}|${c.phone}|${c.email.toLowerCase()}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }
        if (sortEnabled) {
            customers.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Save states
        processedEmails = finalEmails;
        processedPhones = finalPhones;
        processedCustomers = customers;

        // ==========================================================================
        // Render Results to UI
        // ==========================================================================
        
        // Render Customer Tab
        customerBadgeCount.textContent = customers.length;
        statCustTotal.textContent = customers.length;
        statCustBoth.textContent = customers.filter(c => c.phone !== "Chưa có SĐT" && c.email !== "Chưa có Email").length;
        statCustPhoneOnly.textContent = customers.filter(c => c.phone !== "Chưa có SĐT" && c.email === "Chưa có Email").length;
        statCustEmailOnly.textContent = customers.filter(c => c.phone === "Chưa có SĐT" && c.email !== "Chưa có Email").length;

        if (customers.length > 0) {
            customerTableBody.innerHTML = customers.map((c, i) => `
                <tr>
                    <td style="text-align: center;">${i + 1}</td>
                    <td><span style="font-weight: 600; color: var(--text-primary);">${escapeHtml(c.name)}</span></td>
                    <td style="font-family: monospace; color: ${c.phone === "Chưa có SĐT" ? 'var(--text-muted)' : 'var(--success-color)'};">${escapeHtml(c.phone)}</td>
                    <td style="font-family: monospace; color: ${c.email === "Chưa có Email" ? 'var(--text-muted)' : 'var(--info-color)'};">${escapeHtml(c.email)}</td>
                </tr>
            `).join('');
            customerOutput.value = customers.map(c => `${c.name}\t${c.phone}\t${c.email}`).join('\n');
        } else {
            customerTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">
                        Dữ liệu khách hàng sẽ hiển thị ở đây sau khi xử lý...
                    </td>
                </tr>
            `;
            customerOutput.value = "";
        }

        // Render Email Tab
        emailBadgeCount.textContent = finalEmails.length;
        statEmailValid.textContent = validEmails.filter(x => !x.corrected).length;
        statEmailCorrected.textContent = correctedEmailsList.length;
        statEmailWrong.textContent = wrongDomainEmails.length;
        statEmailInvalid.textContent = invalidEmailsList.length;
        emailOutput.value = finalEmails.join('\n');

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

        if (dupPhoneCount > 0) {
            statPhoneDupCard.style.borderColor = 'var(--warning-accent-border)';
            statPhoneDupCard.style.color = 'var(--warning-accent-color)';
            
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

    // Combined Excel Download (.xls HTML-based Excel sheet)
    downloadExcel.addEventListener('click', () => {
        if (processedEmails.length === 0 && processedPhones.length === 0) {
            showToast("Không có dữ liệu sạch để tải xuống!", true);
            return;
        }

        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>KetQuaLoc</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <meta charset="utf-8">
                <style>
                    th { background-color: #6366f1; color: white; font-weight: bold; font-size: 11pt; border: 0.5pt solid #ccc; padding: 6px; }
                    td { border: 0.5pt solid #ccc; padding: 6px; font-family: Arial, sans-serif; font-size: 10pt; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <th style="width: 50px;">STT</th>
                        <th style="width: 250px;">Email / Gmail Đã Lọc</th>
                        <th style="width: 180px;">Số Điện Thoại Chuẩn Hóa</th>
                    </tr>
        `;
        
        const maxLen = Math.max(processedEmails.length, processedPhones.length);
        for (let i = 0; i < maxLen; i++) {
            const email = processedEmails[i] || "";
            const phone = processedPhones[i] || "";
            html += `
                <tr>
                    <td style="text-align: center;">${i + 1}</td>
                    <td>${email}</td>
                    <td style="mso-number-format:'\\@'; text-align: left;">${phone}</td>
                </tr>
            `;
        }
        
        html += `
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", 'gmail_and_phone_results_combined.xls');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Đã tải xuống tệp Excel tổng hợp!");
    });
});
