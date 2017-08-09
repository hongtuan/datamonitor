export const enum DlgMode {Add=1,Edit,View};
export const AuthorizationInfo = [
  { value: 'view', display: 'Monitor', authorizedRes:['location','sysinfo'] },
  { value: 'admin', display: 'Administrator', authorizedRes:['location','user','sysinfo'] },
  { value: 'root', display: 'SuperUser', authorizedRes:['all'] }
];
