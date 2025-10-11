export interface Champion {
  id: number | string;
  key?: string;
  name: string;
  title?: string;
  tags?: string[];
  [k: string]: any;
}
