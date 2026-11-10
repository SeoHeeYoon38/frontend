import styled from "styled-components";

export const Page = styled.div`
  width: 100%; max-width: 402px; min-height: 100dvh; margin: 0 auto; padding-bottom: 34px;
  color: #1a1a1a; background: #ffffff; font-family: "Noto Sans KR", Arial, sans-serif;
  a { color: inherit; text-decoration: none; }
  button { padding: 0; border: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }
`;
export const Header = styled.header`
  height: 54px; display: flex; align-items: center; gap: 14px; padding: 0 20px;
  a { width: 22px; height: 40px; display: grid; place-items: center; }
  img { width: 10px; height: 18px; }
  h1 { margin: 0; font-size: 17px; line-height: 24px; font-weight: 700; }
`;
export const Status = styled.section`
  display: flex; align-items: center; gap: 14px; padding: 24px 20px;
  > span { display: flex; flex-direction: column; gap: 3px; }
  strong { display: flex; align-items: center; gap: 6px; font-size: 17px; line-height: 24px; }
  strong i { width: 6px; height: 6px; border-radius: 50%; background: #00c7df; }
  strong b { color: #0079c2; font-size: 12px; font-weight: 500; }
  small { color: #8a8a8e; font-size: 13px; line-height: 18px; }
`;
export const Logo = styled.span`
  width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid #e4e6ec; border-radius: 14px;
  img { width: 31px; height: 29px; object-fit: contain; }
`;
export const Imported = styled.section`
  display: flex; align-items: center; gap: 10px; padding: 0 20px 20px;
  > span { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  strong { font-size: 15px; line-height: 22px; font-weight: 500; }
  strong b { color: #0079c2; }
  small { overflow: hidden; color: #8a8a8e; font-size: 12px; white-space: nowrap; text-overflow: ellipsis; }
  button { flex: 0 0 auto; padding: 7px 12px; border: 1px solid #e4e6ec; border-radius: 16px; font-size: 13px; font-weight: 700; }
`;
export const Band = styled.div`height: 8px; background: #f3f5fa;`;
export const ListSection = styled.section`
  padding: 20px 20px 4px;
  h2 { margin: 0; color: #8a8a8e; font-size: 13px; line-height: 18px; }
  > p { margin: 2px 0 8px; color: #8a8a8e; font-size: 12px; line-height: 17px; }
`;
export const CheckRow = styled.div`
  min-height: 48px; display: flex; align-items: center; gap: 12px;
  button { width: 22px; height: 22px; display: grid; place-items: center; border: 1.5px solid #e4e6ec; border-radius: 6px; color: #ffffff; font-size: 15px; font-weight: 700; }
  button[aria-checked="true"] { border-color: #090738; background: #090738; }
  strong { min-width: 0; flex: 1; font-size: 15px; line-height: 22px; font-weight: 500; }
  span { color: #8a8a8e; font-size: 13px; }
`;
export const AutoImport = styled.section`
  display: flex; align-items: center; gap: 12px; padding: 18px 20px;
  > span { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  strong { font-size: 15px; line-height: 22px; font-weight: 500; }
  small { color: #8a8a8e; font-size: 12px; line-height: 17px; }
`;
export const Toggle = styled.button`
  position: relative; width: 48px; height: 28px; flex: 0 0 auto; border-radius: 14px; background: #dfe1e8 !important;
  &[aria-checked="true"] { background: #090738 !important; }
  span { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; transition: transform .18s; }
  &[aria-checked="true"] span { transform: translateX(20px); }
`;
export const Disconnect = styled.button`
  width: 100%; display: flex; flex-direction: column; gap: 4px; padding: 20px !important; text-align: left;
  strong { color: #e5484d; font-size: 15px; line-height: 22px; }
  small { color: #8a8a8e; font-size: 12px; line-height: 17px; }
`;
export const HomeIndicator = styled.div`
  position: fixed; right: 0; bottom: 8px; left: 0; width: 134px; height: 5px; margin: auto; border-radius: 3px; background: #000000;
`;
export const Overlay = styled.div`
  position: fixed; z-index: 10; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5);
`;
export const Dialog = styled.div`
  width: min(calc(100% - 80px), 322px); padding: 28px 24px 20px; border-radius: 24px; background: #ffffff; text-align: center;
  > strong { font-size: 17px; line-height: 24px; }
  > p { margin: 8px 0 24px; color: #5c5c63; font-size: 14px; line-height: 20px; }
  > div { display: flex; gap: 8px; }
  button { min-height: 52px; flex: 1; border-radius: 14px; background: #f3f5fa; font-weight: 700; }
  button[data-danger] { color: #ffffff; background: #e5484d; }
`;
