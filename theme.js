/**
 * 通用主题切换系统
 * @author YatingTong
 * @since 2024-01-15
 */

// 主题切换功能
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 更新meta标签的theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', newTheme === 'light' ? '#1e40af' : '#1e3a8a');
    }
    
    // 触发主题变化事件
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const theme = savedTheme || systemTheme;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新meta标签
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'light' ? '#1e40af' : '#1e3a8a');
    }
    
    return theme;
}

// 获取当前主题
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新meta标签
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'light' ? '#1e40af' : '#1e3a8a');
        }
        
        // 触发主题变化事件
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
});

// 页面加载时自动初始化主题
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});

// 导出函数以供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        initTheme,
        getCurrentTheme
    };
} 