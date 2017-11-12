export class Location {
  _id: string;
  name: string;
  ctpos?: string;
  gwpos?: string;
  datasrc: string;
  snapcount?: number;
  synperiod: number;
  monitperiod: number;
  alertPolicy: Array<any>;
  boundaries?: string;
  latestDataOn?:Date;
  address?:string;
  contactInfo?:string;
  emails?:string;
  isAutoSynData?:boolean;
  constructor(config){
    this.name = config.name||'';
    this.address = config.address || '';
    this.contactInfo = config.contactInfo ||'';
    this.emails = config.emails || '';
    this.datasrc = config.datasrc || '';
    this.snapcount = config.snapcount || 10;
    this.synperiod = config.synperiod || 600;
    this.monitperiod = config.monitperiod || 900;
    this.alertPolicy = config.alertPolicy || '';
  }
}
