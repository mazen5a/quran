// Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 50,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Add floating animation to project cards on hover
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.classList.add('floating');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('floating');
            });
        });
        window.onblur = () =>{
            document.title = 'MAG-FIRE | لييييه؟؟';
        }
        window.onfocus = () =>{
            document.title = 'MAG-FIRE |هو ده الكلام';
        }
