import {createBrowserRouter} from 'react-router-dom';
import {lazy, Suspense} from 'react';
import App from '@/App';

// 懒加载页面组件
const Home = lazy(() => import('@/pages/Home'));
const Base64Page = lazy(() => import('@/pages/tools/Base64Page'));
const Base58Page = lazy(() => import('@/pages/tools/Base58Page'));
const Base32Page = lazy(() => import('@/pages/tools/Base32Page'));
const UnicodePage = lazy(() => import('@/pages/tools/UnicodePage'));
const JsonFormatterPage = lazy(() => import('@/pages/tools/JsonFormatterPage'));
const YamlFormatterPage = lazy(() => import('@/pages/tools/YamlFormatterPage'));
const HtmlFormatterPage = lazy(() => import('@/pages/tools/HtmlFormatterPage'));
const TimestampPage = lazy(() => import('@/pages/tools/TimestampPage'));
const DiffPage = lazy(() => import('@/pages/tools/DiffPage'));
const PixelArtPage = lazy(() => import('@/pages/tools/PixelArtPage'));
const UrlCodecPage = lazy(() => import('@/pages/tools/UrlCodecPage'));
const UuidGeneratorPage = lazy(() => import('@/pages/tools/UuidGeneratorPage'));
const ColorPickerPage = lazy(() => import('@/pages/tools/ColorPickerPage'));
const HashPage = lazy(() => import('@/pages/tools/HashPage'));
const PasswordGeneratorPage = lazy(() => import('@/pages/tools/PasswordGeneratorPage'));
const BaseConverterPage = lazy(() => import('@/pages/tools/BaseConverterPage'));
const QrCodePage = lazy(() => import('@/pages/tools/QrCodePage'));
const RegexTesterPage = lazy(() => import('@/pages/tools/RegexTesterPage'));
const JwtDecoderPage = lazy(() => import('@/pages/tools/JwtDecoderPage'));
const CronParserPage = lazy(() => import('@/pages/tools/CronParserPage'));
const MarkdownEditorPage = lazy(() => import('@/pages/tools/MarkdownEditorPage'));
const SqlFormatterPage = lazy(() => import('@/pages/tools/SqlFormatterPage'));
const CsvJsonConverterPage = lazy(() => import('@/pages/tools/CsvJsonConverterPage'));
const AesEncryptionPage = lazy(() => import('@/pages/tools/AesEncryptionPage'));
const HtmlEscapePage = lazy(() => import('@/pages/tools/HtmlEscapePage'));
const LoremIpsumPage = lazy(() => import('@/pages/tools/LoremIpsumPage'));
const UserAgentParserPage = lazy(() => import('@/pages/tools/UserAgentParserPage'));
const BcryptPage = lazy(() => import('@/pages/tools/BcryptPage'));
const TextCasePage = lazy(() => import('@/pages/tools/TextCasePage'));
const ImageBase64Page = lazy(() => import('@/pages/tools/ImageBase64Page'));
const BarcodePage = lazy(() => import('@/pages/tools/BarcodePage'));
const KeyboardInspectorPage = lazy(() => import('@/pages/tools/KeyboardInspectorPage'));
const AsciiArtPage = lazy(() => import('@/pages/tools/AsciiArtPage'));
const TextToSpeechPage = lazy(() => import('@/pages/tools/TextToSpeechPage'));
const TeamRandomizerPage = lazy(() => import('@/pages/tools/TeamRandomizerPage'));
const ScoreboardPage = lazy(() => import('@/pages/tools/ScoreboardPage'));
const WheelSpinnerPage = lazy(() => import('@/pages/tools/WheelSpinnerPage'));
const PomodoroPage = lazy(() => import('@/pages/tools/PomodoroPage'));
const CounterPage = lazy(() => import('@/pages/tools/CounterPage'));
const CountdownPage = lazy(() => import('@/pages/tools/CountdownPage'));
const StopwatchPage = lazy(() => import('@/pages/tools/StopwatchPage'));
const CoinFlipPage = lazy(() => import('@/pages/tools/CoinFlipPage'));
const IpConverterPage = lazy(() => import('@/pages/tools/IpConverterPage'));
const IpCalculatorPage = lazy(() => import('@/pages/tools/IpCalculatorPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// 加载组件包装器
const LazyWrapper = ({children}: { children: React.ReactNode }) => (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    }>
        {children}
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [
            {
                index: true,
                element: <LazyWrapper><Home/></LazyWrapper>
            },
            {
                path: 'base64',
                element: <LazyWrapper><Base64Page/></LazyWrapper>
            },
            {
                path: 'base58',
                element: <LazyWrapper><Base58Page/></LazyWrapper>
            },
            {
                path: 'base32',
                element: <LazyWrapper><Base32Page/></LazyWrapper>
            },
            {
                path: 'unicode',
                element: <LazyWrapper><UnicodePage/></LazyWrapper>
            },
            {
                path: 'json-formatter',
                element: <LazyWrapper><JsonFormatterPage/></LazyWrapper>
            },
            {
                path: 'yaml-formatter',
                element: <LazyWrapper><YamlFormatterPage/></LazyWrapper>
            },
            {
                path: 'html-formatter',
                element: <LazyWrapper><HtmlFormatterPage/></LazyWrapper>
            },
            {
                path: 'timestamp-converter',
                element: <LazyWrapper><TimestampPage/></LazyWrapper>
            },
            {
                path: 'text-diff',
                element: <LazyWrapper><DiffPage/></LazyWrapper>
            },
            {
                path: 'pixel-art',
                element: <LazyWrapper><PixelArtPage/></LazyWrapper>
            },
            {
                path: 'url-codec',
                element: <LazyWrapper><UrlCodecPage/></LazyWrapper>
            },
            {
                path: 'uuid-generator',
                element: <LazyWrapper><UuidGeneratorPage/></LazyWrapper>
            },
            {
                path: 'color-picker',
                element: <LazyWrapper><ColorPickerPage/></LazyWrapper>
            },
            {
                path: 'hash',
                element: <LazyWrapper><HashPage/></LazyWrapper>
            },
            {
                path: 'password-generator',
                element: <LazyWrapper><PasswordGeneratorPage/></LazyWrapper>
            },
            {
                path: 'base-converter',
                element: <LazyWrapper><BaseConverterPage/></LazyWrapper>
            },
            {
                path: 'qr-code-generator',
                element: <LazyWrapper><QrCodePage/></LazyWrapper>
            },
            {
                path: 'regex-tester',
                element: <LazyWrapper><RegexTesterPage/></LazyWrapper>
            },
            {
                path: 'jwt-decoder',
                element: <LazyWrapper><JwtDecoderPage/></LazyWrapper>
            },
            {
                path: 'cron-parser',
                element: <LazyWrapper><CronParserPage/></LazyWrapper>
            },
            {
                path: 'markdown-editor',
                element: <LazyWrapper><MarkdownEditorPage/></LazyWrapper>
            },
            {
                path: 'sql-formatter',
                element: <LazyWrapper><SqlFormatterPage/></LazyWrapper>
            },
            {
                path: 'csv-json-converter',
                element: <LazyWrapper><CsvJsonConverterPage/></LazyWrapper>
            },
            {
                path: 'aes-encryption',
                element: <LazyWrapper><AesEncryptionPage/></LazyWrapper>
            },
            {
                path: 'html-escape',
                element: <LazyWrapper><HtmlEscapePage/></LazyWrapper>
            },
            {
                path: 'lorem-ipsum',
                element: <LazyWrapper><LoremIpsumPage/></LazyWrapper>
            },
            {
                path: 'user-agent-parser',
                element: <LazyWrapper><UserAgentParserPage/></LazyWrapper>
            },
            {
                path: 'bcrypt',
                element: <LazyWrapper><BcryptPage/></LazyWrapper>
            },
            {
                path: 'text-case',
                element: <LazyWrapper><TextCasePage/></LazyWrapper>
            },
            {
                path: 'image-base64',
                element: <LazyWrapper><ImageBase64Page/></LazyWrapper>
            },
            {
                path: 'barcode',
                element: <LazyWrapper><BarcodePage/></LazyWrapper>
            },
            {
                path: 'keyboard-inspector',
                element: <LazyWrapper><KeyboardInspectorPage/></LazyWrapper>
            },
            {
                path: 'ascii-art',
                element: <LazyWrapper><AsciiArtPage/></LazyWrapper>
            },
            {
                path: 'text-to-speech',
                element: <LazyWrapper><TextToSpeechPage/></LazyWrapper>
            },
            {
                path: 'team-randomizer',
                element: <LazyWrapper><TeamRandomizerPage/></LazyWrapper>
            },
            {
                path: 'scoreboard',
                element: <LazyWrapper><ScoreboardPage/></LazyWrapper>
            },
            {
                path: 'wheel-spinner',
                element: <LazyWrapper><WheelSpinnerPage/></LazyWrapper>
            },
            {
                path: 'pomodoro',
                element: <LazyWrapper><PomodoroPage/></LazyWrapper>
            },
            {
                path: 'counter',
                element: <LazyWrapper><CounterPage/></LazyWrapper>
            },
            {
                path: 'countdown',
                element: <LazyWrapper><CountdownPage/></LazyWrapper>
            },
            {
                path: 'stopwatch',
                element: <LazyWrapper><StopwatchPage/></LazyWrapper>
            },
            {
                path: 'coin-flip',
                element: <LazyWrapper><CoinFlipPage/></LazyWrapper>
            },
            {
                path: 'ip-converter',
                element: <LazyWrapper><IpConverterPage/></LazyWrapper>
            },
            {
                path: 'ip-calculator',
                element: <LazyWrapper><IpCalculatorPage/></LazyWrapper>
            },
            {
                path: '*',
                element: <LazyWrapper><NotFoundPage/></LazyWrapper>
            }
        ]
    }
]);
