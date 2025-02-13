import { useState } from "react";
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  useColorMode,
  Skeleton,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import { SearchIcon, ExternalLinkIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [files, setFiles] = useState([]);

  // AI Search states
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { colorMode, toggleColorMode } = useColorMode();

  const pollAiResult = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/v1/ai_search/${id}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      });
      const data = await res.json();

      console.log("AI検索結果:", data);

      if (!data.completed) {
        setTimeout(() => pollAiResult(id), 2000);
      } else {
        setAiResult(data.data);
        setAiLoading(false);
      }
    } catch (error) {
      console.error("AI検索エラー:", error);
      setAiLoading(false);
    }
  };

  const handleAiSearch = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("http://localhost:8080/v1/ai_search", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.id) {
        pollAiResult(data.id);
      } else {
        setAiLoading(false);
      }
    } catch (error) {
      console.error("AI検索開始エラー:", error);
      setAiLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`http://localhost:8080/v1/fast_search/${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setWebsites(data.websites);
      setFiles(data.local_files || []);
    } catch (error) {
      console.error("検索エラー:", error);
      setWebsites([]);
      setFiles([]);
    }
    setHasSearched(true);
    setIsLoading(false);
    // initiate AI search after fast search completes
    handleAiSearch();
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const darkModeToggle = (
    <IconButton
      aria-label="Toggle dark mode"
      icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      position="absolute"
      top="1rem"
      right="1rem"
      variant="ghost"
    />
  );

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={8} px={4} position="relative">
      {darkModeToggle}
      <Container maxW="container.xl">
        {/* ヘッダー */}
        <VStack spacing={4} textAlign="center" mb={8}>
          <Heading as="h1" size="2xl">
            Floorp Search
          </Heading>
          <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.300")}>
            ここに検索キーワードを入力してください
          </Text>
        </VStack>

        {/* 検索フォーム */}
        <Box as="form" onSubmit={handleSearch} mb={8}>
          <InputGroup size="lg">
            <Input
              placeholder="検索キーワードを入力..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="full"
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
              fontSize="md"
              h="56px"
              pr="4.5rem"
            />
            <InputRightElement h="56px" w="4.5rem">
              <IconButton
                aria-label="Search"
                icon={<SearchIcon />}
                borderRadius="full"
                colorScheme="blue"
                size="md"
                type="submit"
                isLoading={isLoading}
              />
            </InputRightElement>
          </InputGroup>
        </Box>

        {/* 検索結果 */}
        {isLoading ? (
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : hasSearched ? (
          websites.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              検索結果がありません。
            </Text>
          ) : (
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
              {websites.map((item: any, idx: number) => (
                <Box
                  key={idx}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  bg={bgColor}
                  p={4}
                  _hover={{ boxShadow: "lg" }}
                  transition="box-shadow 0.2s"
                >
                  <Link href={item.url} isExternal _hover={{ textDecoration: "none" }}>
                    <Heading as="h3" size="md" mb={2}>
                      {item.title} <ExternalLinkIcon mx={1} />
                    </Heading>
                  </Link>
                  <Text mb={2} fontSize="sm">
                    {item.description}
                  </Text>
                  {item.image_url && (
                    <Box mb={2}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        style={{ maxWidth: "100%", borderRadius: "4px" }}
                      />
                    </Box>
                  )}
                  {item.sitename && (
                    <Text fontSize="xs" color="blue.500">
                      {item.sitename}
                    </Text>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          )
        ) : null}

        {/* ローカルファイル検索結果 */}
        {hasSearched && files.length > 0 && (
          <Box mt={12}>
            <Heading as="h2" size="xl" mb={4}>
              ローカルファイル検索結果
            </Heading>
            {files.map((file: any, idx: number) => (
              <Box
                key={idx}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                bg={bgColor}
                p={4}
                mb={4}
              >
                <Heading as="h3" size="md" mb={2}>
                  {file.file_name}
                </Heading>
                <Text mb={2} fontSize="sm">
                  {file.file_path}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* AI Search 結果の表示 */}
        {hasSearched && (
          <Box mt={12}>
            <Heading as="h2" size="xl" mb={4}>
              AI Search 結果
            </Heading>
            {aiLoading ? (
              <Text>AI検索中...</Text>
            ) : aiResult ? (
              <VStack align="start" spacing={4}>
                <ReactMarkdown>{aiResult.text}</ReactMarkdown>
                {aiResult.websites && (
                  <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                    {aiResult.websites.map((item: any, idx: number) => (
                      <Box
                        key={idx}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="lg"
                        overflow="hidden"
                        bg={bgColor}
                        p={4}
                        _hover={{ boxShadow: "lg" }}
                        transition="box-shadow 0.2s"
                      >
                        <Link href={item.url} isExternal _hover={{ textDecoration: "none" }}>
                          <Heading as="h3" size="md" mb={2}>
                            {item.title} <ExternalLinkIcon mx={1} />
                          </Heading>
                        </Link>
                        <Text mb={2} fontSize="sm">
                          {item.description}
                        </Text>
                        {item.image_url && (
                          <Box mb={2}>
                            <img
                              src={item.image_url}
                              alt={item.title}
                              style={{ maxWidth: "100%", borderRadius: "4px" }}
                            />
                          </Box>
                        )}
                        {item.sitename && (
                          <Text fontSize="xs" color="blue.500">
                            {item.sitename}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            ) : (
              <Text>AI検索結果はありません。</Text>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
