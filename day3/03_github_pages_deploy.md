
# 3. 깃허브를 통한 나만의 페이지 만들기

## GitHub Pages란?
- 깃허브(GitHub)에서 무료로 제공하는 정적 웹사이트 호스팅 서비스입니다.
- 내 깃허브 저장소(Repository)에 있는 HTML, CSS, JS 파일들을 실제 웹사이트로 만들어줍니다.

## 왜 사용하는가?
- **무료:** 복잡한 서버 설정이나 비용 없이 나만의 웹사이트를 가질 수 있습니다.
- **쉬운 배포:** `git push`만 하면 자동으로 웹사이트에 변경 사항이 반영됩니다.
- **포트폴리오:** 내가 만든 프로젝트를 다른 사람에게 쉽게 공유하고 보여줄 수 있습니다.

## 실습: Docsify 사이트 배포하기
- 우리가 지금까지 작업한 이 강의 자료 사이트도 GitHub Pages와 Docsify로 만들어졌습니다.

### 단계별 가이드
1. **새로운 저장소 생성:** 깃허브에서 `[내 아이디].github.io` 라는 이름으로 새로운 public 저장소를 만듭니다.
2. **로컬에 클론:** `git clone [저장소 주소]` 명령어로 내 컴퓨터에 저장소를 복사합니다.
3. **Docsify 초기화:** 해당 폴더로 이동하여 Docsify-cli를 이용해 초기 설정 파일을 생성합니다.
   ```bash
   # docsify-cli가 없다면 설치
   npm i docsify-cli -g
   # 초기화
   docsify init ./
   ```
4. **파일 수정:** `index.html`, `_sidebar.md`, `README.md` 등 내용을 내 프로젝트에 맞게 수정합니다.
5. **깃허브에 푸시:** 변경된 내용을 깃허브에 올립니다.
   ```bash
   git add .
   git commit -m "Initial commit with docsify"
   git push origin main
   ```
6. **확인:** 잠시 후 `https://[내 아이디].github.io` 주소로 접속하여 사이트가 잘 뜨는지 확인합니다.
