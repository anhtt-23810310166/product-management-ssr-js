/**
 * Automatic SEO Checker Script
 * Phân tích và đánh giá SEO theo thời gian thực cho trang Create/Edit
 */

document.addEventListener("DOMContentLoaded", () => {
    const seoKeyword = document.getElementById("seoKeyword");
    const seoTitle = document.getElementById("seoTitle");
    const seoDescription = document.getElementById("seoDescription");
    const contentTextarea = document.querySelector("textarea[name='description']");
    const productTitle = document.querySelector("input[name='title']");
    
    // Elements checklist
    const checkTitleLen = document.getElementById("checkTitleLen");
    const checkDescLen = document.getElementById("checkDescLen");
    const checkFocusTitle = document.getElementById("checkFocusTitle");
    const checkFocusDesc = document.getElementById("checkFocusDesc");
    const checkFocusContent = document.getElementById("checkFocusContent");
    const checkContentLen = document.getElementById("checkContentLen");
    
    const badge = document.getElementById("seoScoreBadge");

    if (!seoKeyword && !seoTitle) return; // Not the right page

    const getEditorContent = () => {
        if (typeof tinymce !== "undefined") {
            const editors = tinymce.editors;
            if (editors && editors.length > 0) {
                return editors[0].getContent({ format: "text" });
            }
        }
        return contentTextarea ? contentTextarea.value : "";
    };

    const updateChecklist = (el, isValid) => {
        if (!el) return;
        const icon = el.querySelector("i");
        if (isValid) {
            icon.className = "fas fa-check-circle text-success mr-2";
            el.style.color = "var(--text-primary)";
        } else {
            icon.className = "fas fa-times-circle text-danger mr-2";
            el.style.color = "var(--text-muted)";
        }
    };

    const analyzeSEO = () => {
        const keyword = seoKeyword ? seoKeyword.value.trim().toLowerCase() : "";
        const title = (seoTitle && seoTitle.value.trim()) ? seoTitle.value.trim() : (productTitle ? productTitle.value.trim() : "");
        const description = (seoDescription && seoDescription.value.trim()) ? seoDescription.value.trim() : "";
        const content = getEditorContent().trim();
        
        const titleLen = title.length;
        const descLen = description.length;
        const wordsCount = content ? content.split(/\s+/).filter(word => word.length > 0).length : 0;
        
        let score = 0;
        
        // 1. Title Length (40-60)
        const isTitleLenValid = titleLen >= 40 && titleLen <= 60;
        updateChecklist(checkTitleLen, isTitleLenValid);
        if (isTitleLenValid) score++;

        // 2. Desc Length (120-160)
        const isDescLenValid = descLen >= 120 && descLen <= 160;
        updateChecklist(checkDescLen, isDescLenValid);
        if (isDescLenValid) score++;

        // 3. Keyword in Title
        const isFocusTitleValid = keyword && title.toLowerCase().includes(keyword);
        updateChecklist(checkFocusTitle, isFocusTitleValid);
        if (isFocusTitleValid) score++;

        // 4. Keyword in Desc
        const isFocusDescValid = keyword && description.toLowerCase().includes(keyword);
        updateChecklist(checkFocusDesc, isFocusDescValid);
        if (isFocusDescValid) score++;

        // 5. Keyword in Content
        const isFocusContentValid = keyword && content.toLowerCase().includes(keyword);
        updateChecklist(checkFocusContent, isFocusContentValid);
        if (isFocusContentValid) score++;

        // 6. Content Length > 300
        const isContentLenValid = wordsCount > 300;
        updateChecklist(checkContentLen, isContentLenValid);
        if (isContentLenValid) score++;

        // Update Badge
        if (!keyword && !title && !description && !content) {
            if (badge) {
                badge.className = "badge bg-secondary";
                badge.textContent = "Chưa có dữ liệu";
            }
        } else if (score >= 5) {
            if (badge) {
                badge.className = "badge bg-success";
                badge.textContent = "Tốt (Xanh)";
            }
        } else if (score >= 3) {
            if (badge) {
                badge.className = "badge bg-warning text-dark";
                badge.textContent = "Khá (Vàng)";
            }
        } else {
            if (badge) {
                badge.className = "badge bg-danger";
                badge.textContent = "Chưa đạt (Đỏ)";
            }
        }
    };

    // Attach listeners
    const inputs = [seoKeyword, seoTitle, seoDescription, productTitle, contentTextarea];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener("input", analyzeSEO);
        }
    });

    // Check TinyMCE events
    if (typeof tinymce !== "undefined") {
        tinymce.on('AddEditor', function(e) {
            e.editor.on('keyup change', function() {
                analyzeSEO();
            });
        });
    }

    // Initial check (in case editing existing data)
    setTimeout(analyzeSEO, 500);
});
