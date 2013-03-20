$(document).ready(function () {
  var actionBar = new ActionBar({
    control: {
      icon: 'twitter',
      label: 'Messages'
    },
    actions: [
      {
        id: 'copy',
        icon: 'copy',
        label: 'Copy'
      },
      {
        id: 'paste',
        icon: 'paste',
        label: 'Paste'
      }
    ]
  });
  actionBar.show();

  setTimeout(function () {
    actionBar.get('control').set('label', 'Foo');
  }, 1000);
});
