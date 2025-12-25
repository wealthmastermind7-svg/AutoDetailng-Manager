(function() {
  'use strict';
  
  var EMBED_ORIGIN = '{{EMBED_ORIGIN}}';
  
  function BookFlowWidget(config) {
    this.config = Object.assign({
      businessSlug: '',
      type: 'inline',
      buttonText: 'Book Now',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      container: null,
      onReady: null,
      onBookingConfirmed: null,
      onClose: null
    }, config);
    
    this.iframe = null;
    this.overlay = null;
    this.modal = null;
    this.isOpen = false;
    
    this.init();
  }
  
  BookFlowWidget.prototype.init = function() {
    if (!this.config.businessSlug) {
      console.error('BookFlow: businessSlug is required');
      return;
    }
    
    switch (this.config.type) {
      case 'inline':
        this.createInlineEmbed();
        break;
      case 'popup-button':
        this.createPopupButton();
        break;
      case 'popup-text':
        this.createPopupText();
        break;
      default:
        console.error('BookFlow: Invalid embed type');
    }
    
    this.setupMessageListener();
  };
  
  BookFlowWidget.prototype.getEmbedUrl = function() {
    return EMBED_ORIGIN + '/embed/' + this.config.businessSlug;
  };
  
  BookFlowWidget.prototype.createIframe = function(style) {
    var iframe = document.createElement('iframe');
    iframe.src = this.getEmbedUrl();
    iframe.style.cssText = 'border: none; width: 100%; ' + (style || '');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allow', 'payment');
    return iframe;
  };
  
  BookFlowWidget.prototype.createInlineEmbed = function() {
    var container = this.config.container;
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      console.error('BookFlow: Container not found');
      return;
    }
    
    this.iframe = this.createIframe('min-height: 600px;');
    container.appendChild(this.iframe);
  };
  
  BookFlowWidget.prototype.createPopupButton = function() {
    var self = this;
    var container = this.config.container;
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      console.error('BookFlow: Container not found');
      return;
    }
    
    var button = document.createElement('button');
    button.textContent = this.config.buttonText;
    button.style.cssText = [
      'background-color: ' + this.config.buttonColor,
      'color: ' + this.config.buttonTextColor,
      'border: none',
      'padding: 14px 28px',
      'font-size: 16px',
      'font-weight: 600',
      'border-radius: 8px',
      'cursor: pointer',
      'transition: opacity 0.2s ease',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ].join('; ');
    
    button.addEventListener('mouseenter', function() {
      button.style.opacity = '0.9';
    });
    button.addEventListener('mouseleave', function() {
      button.style.opacity = '1';
    });
    button.addEventListener('click', function() {
      self.openModal();
    });
    
    container.appendChild(button);
  };
  
  BookFlowWidget.prototype.createPopupText = function() {
    var self = this;
    var container = this.config.container;
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      console.error('BookFlow: Container not found');
      return;
    }
    
    var link = document.createElement('a');
    link.textContent = this.config.buttonText;
    link.href = '#';
    link.style.cssText = [
      'color: ' + this.config.buttonColor,
      'text-decoration: underline',
      'font-weight: 500',
      'cursor: pointer'
    ].join('; ');
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      self.openModal();
    });
    
    container.appendChild(link);
  };
  
  BookFlowWidget.prototype.openModal = function() {
    if (this.isOpen) return;
    this.isOpen = true;
    
    var self = this;
    
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'right: 0',
      'bottom: 0',
      'background: rgba(0, 0, 0, 0.5)',
      'z-index: 999998',
      'opacity: 0',
      'transition: opacity 0.3s ease'
    ].join('; ');
    
    this.modal = document.createElement('div');
    this.modal.style.cssText = [
      'position: fixed',
      'top: 50%',
      'left: 50%',
      'transform: translate(-50%, -50%) scale(0.95)',
      'width: 90%',
      'max-width: 420px',
      'max-height: 90vh',
      'background: #fff',
      'border-radius: 16px',
      'overflow: hidden',
      'z-index: 999999',
      'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      'opacity: 0',
      'transition: opacity 0.3s ease, transform 0.3s ease'
    ].join('; ');
    
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = [
      'position: absolute',
      'top: 12px',
      'right: 12px',
      'width: 32px',
      'height: 32px',
      'border: none',
      'background: rgba(0, 0, 0, 0.1)',
      'border-radius: 50%',
      'font-size: 20px',
      'cursor: pointer',
      'z-index: 1',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'color: #333'
    ].join('; ');
    closeBtn.addEventListener('click', function() {
      self.closeModal();
    });
    
    this.iframe = this.createIframe('height: 600px; max-height: 80vh;');
    
    this.modal.appendChild(closeBtn);
    this.modal.appendChild(this.iframe);
    
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
    document.body.style.overflow = 'hidden';
    
    this.overlay.addEventListener('click', function() {
      self.closeModal();
    });
    
    requestAnimationFrame(function() {
      self.overlay.style.opacity = '1';
      self.modal.style.opacity = '1';
      self.modal.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    document.addEventListener('keydown', this.handleEscape = function(e) {
      if (e.key === 'Escape') {
        self.closeModal();
      }
    });
  };
  
  BookFlowWidget.prototype.closeModal = function() {
    if (!this.isOpen) return;
    
    var self = this;
    
    this.overlay.style.opacity = '0';
    this.modal.style.opacity = '0';
    this.modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
    setTimeout(function() {
      if (self.overlay && self.overlay.parentNode) {
        self.overlay.parentNode.removeChild(self.overlay);
      }
      if (self.modal && self.modal.parentNode) {
        self.modal.parentNode.removeChild(self.modal);
      }
      document.body.style.overflow = '';
      self.isOpen = false;
      self.iframe = null;
      self.overlay = null;
      self.modal = null;
      
      if (self.config.onClose) {
        self.config.onClose();
      }
    }, 300);
    
    document.removeEventListener('keydown', this.handleEscape);
  };
  
  BookFlowWidget.prototype.setupMessageListener = function() {
    var self = this;
    
    window.addEventListener('message', function(event) {
      if (!event.data || event.data.source !== 'bookflow-embed') return;
      
      switch (event.data.type) {
        case 'ready':
          if (self.config.onReady) {
            self.config.onReady();
          }
          break;
        case 'resize':
          if (self.iframe && self.config.type === 'inline') {
            self.iframe.style.height = event.data.height + 'px';
          }
          break;
        case 'booking-confirmed':
          if (self.config.onBookingConfirmed) {
            self.config.onBookingConfirmed(event.data.bookingId);
          }
          break;
        case 'close-request':
          if (self.config.type !== 'inline') {
            self.closeModal();
          }
          break;
      }
    });
  };
  
  window.BookFlowWidget = BookFlowWidget;
  
  if (typeof window.BookFlowQueue !== 'undefined' && Array.isArray(window.BookFlowQueue)) {
    window.BookFlowQueue.forEach(function(config) {
      new BookFlowWidget(config);
    });
  }
})();
