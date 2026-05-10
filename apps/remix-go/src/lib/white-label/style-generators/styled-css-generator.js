export default (id, brandLogo, theme) => `
.theme-${id} .navbar-brand {
    background: url('${brandLogo || '../static/images/logo.svg'}') no-repeat 0;
    background-size: contain;
}

.theme-${id} .go-button,
.theme-${id} .cta-library .cta-library-inner .card .overlay .buttons-container .button-primary,
.theme-${id} .position-selector .position-selector-cell,
.theme-${id} .card .overlay .buttons-container .button-primary,
.theme-${id} .editor-wrapper .canvas .stage-wrapper,
.theme-${id} .publish-overview .publish-overview-inner .overview-column .overview-edit .button-primary,
.theme-${id} .phase-component .phase-state-tabs .stepper .stepper-tab-group.active .phase-label:hover,
.theme-${id} .phase-component .phase-state-container .stepper .stepper-tab-group.active .phase-label:hover,
.theme-${id} .campaign .workspace .embed-progress .progress-bar,
.theme-${id} .video-upload .video-upload-container .upload-progress .upload-progress-bar .progress-bar {
  background: ${theme.primaryColor};
}

.theme-${id} .video-upload .video-range-container .video-range-track {
  background: ${theme.primaryColor} !important;
}

.theme-${id} .getting-started .welcome *,
.theme-${id} .personalizer .token-list .token-list-item.selected,
.theme-${id} .personalizer .setup-area .configuration-list .configuration-list-item.selected,
.theme-${id} .text-editor .decoration-toggle,
.theme-${id}.header .nav-item .label,
.theme-${id}.header .navbar-light .navbar-nav .nav-link,
.theme-${id}.header .navbar-light .navbar-nav .nav-link:hover,
.theme-${id}.header .navbar-light .navbar-nav .nav-link:focus {
  color: ${theme.primaryColor};
}

.theme-${id} .cta-library .cta-library-inner .card .overlay .buttons-container .button-primary,
.theme-${id} .popcorn-editor .color-picker-button-container .color-picker-button,
.theme-${id} .publish-overview .publish-overview-inner .overview-column .overview-edit .button-primary,
.theme-${id} .card .overlay .buttons-container .button-primary {
  border-color: ${theme.primaryColor};
}

.theme-${id}.header .group-bordered,
.theme-${id} .phase-component .phase-state-tabs .stepper .stepper-tab-group.active .phase-label,
.theme-${id} .phase-component .phase-state-container .stepper .stepper-tab-group.active .phase-label,
.theme-${id} .phase-component .phase-state-tabs .stepper .stepper-tab-group .phase-label,
.theme-${id} .phase-component .phase-state-container .stepper .stepper-tab-group .phase-label,
.theme-${id} .phase-component .phase-state-tabs .stepper .line,
.theme-${id} .phase-component .phase-state-container .stepper .line {
  border: 1px solid ${theme.primaryColor};
}

.theme-${id} .editor-wrapper .canvas .stage-wrapper .stage-item.active {
  background: ${theme.stageSelectColor};
}

.theme-${id} .go-switch .btn.active {
  background-color: ${theme.primaryColor} !important;
}

.theme-${id} .phase-component .phase-state-tabs .stepper .stepper-tab-group .phase-label,
.theme-${id} .popcorn-editor .color-picker-button-container .color-picker-button,
.theme-${id} .image-upload .text-resolution,
.theme-${id} .phase-component .phase-state-container .stepper .stepper-tab-group .phase-label {
  color: ${theme.primaryColor};
}

.theme-${id} .phase-component .phase-state-tabs .stepper .stepper-tab-group.active .phase-label,
.theme-${id} .phase-component .phase-state-container .stepper .stepper-tab-group.active .phase-label {
  background: ${theme.phaseHighlightColor};
}

.theme-${id} .phase-component .phase-state-tabs .stepper .stepper-tab-group .phase-label:hover,
.theme-${id} .phase-component .phase-state-container .stepper .stepper-tab-group .phase-label:hover {
  background: ${theme.phaseHighlightColor};
}

.theme-${id} .construction-container .active .resize-handle,
.theme-${id} .construction-container .active {
  border: ${theme.primaryColor} solid 0.5px;
}

.theme-${id} .image-editor .zoomer input[type=range]::-webkit-slider-runnable-track {
  -webkit-box-shadow: 0px 0px 1px ${theme.primaryColor};
  box-shadow: 0px 0px 1px ${theme.primaryColor};
  background: ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
}

.theme-${id} .image-editor .zoomer input[type=range]::-webkit-slider-thumb {
  -webkit-box-shadow: 1px 1px 1px ${theme.primaryColor};
  box-shadow: 1px 1px 1px ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
}
.theme-${id} .image-editor .zoomer input[type=range]:focus::-webkit-slider-runnable-track {
  background: ${theme.primaryColor};
}
.theme-${id} .image-editor .zoomer input[type=range]::-moz-range-track {
  box-shadow: 0px 0px 1px ${theme.primaryColor};
  background: ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
}

.theme-${id} .image-editor .zoomer input[type=range]::-moz-range-thumb {
  box-shadow: 1px 1px 1px ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
}

.theme-${id} .image-editor .zoomer input[type=range]::-ms-fill-lower {
  background: ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
  box-shadow: 0px 0px 1px ${theme.primaryColor};
}

.theme-${id} .image-editor .zoomer input[type=range]::-ms-fill-upper {
  background: ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
  box-shadow: 0px 0px 1px ${theme.primaryColor};
}

.theme-${id} .image-editor .zoomer input[type=range]::-ms-thumb {
  box-shadow: 1px 1px 1px ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor}; 
}

.theme-${id} .video-upload .video-range-container .video-range-slider {
  background: ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
}

.theme-${id} .publish-overview .publish-overview-inner .overview-column .embed-item textarea[type="textarea"]:focus,
.theme-${id} .publish-overview .publish-overview-inner .overview-column .overview-item:focus {
  border-color: ${theme.primaryColor};
}

.theme-${id} .video-upload .video-upload-container .external-video-link:focus {
  border: 2px solid ${theme.primaryColor};
}
`;
