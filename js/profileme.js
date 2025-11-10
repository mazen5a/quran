// إنشاء النجوم العشوائية
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            star.style.width = `${Math.random() * 3}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            starsContainer.appendChild(star);
        }
        
        // تفعيل أشرطة التقدم
        document.addEventListener('DOMContentLoaded', function() {
            const skillBars = document.querySelectorAll('.skill-progress');
            skillBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = `${width}%`;
                }, 500);
            });
        });
        
        // تأثيرات إضافية للعناصر العائمة
        document.addEventListener('mousemove', function(e) {
            const floatingElements = document.querySelectorAll('.floating-element');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            floatingElements.forEach((element, index) => {
                const speed = 0.02 + (index * 0.01);
                const xMovement = (x - 0.5) * 50 * speed;
                const yMovement = (y - 0.5) * 50 * speed;
                
                element.style.transform = `translate(${xMovement}px, ${yMovement}px)`;
            });
        });