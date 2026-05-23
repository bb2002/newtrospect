// mobile 은 pnpm workspace 에서 분리되어 자체 npm 으로 관리.
// @newtrospect/core 는 file: 의존성 → node_modules/@newtrospect/core 가 packages/core 로 symlink.
//
// Metro 가 그 symlink 와 그 안의 *.ts 를 따라가도록 한 가지 보강:
//   - watchFolders 에 packages/core 의 상위(workspaceRoot) 추가 → core 변경 시 hot reload
//   - resolver.unstable_enableSymlinks: true (SDK 51 부터 기본 true 지만 명시)
//
// 단, mobile 자체 node_modules 만 사용하므로 nodeModulesPaths 는 추가 설정 불필요 (단일 위치).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(workspaceRoot, "packages/core")];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
