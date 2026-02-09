import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  useColorModeValue,
  Select,
  HStack,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchGDPStats, GDPStat } from 'src/api/gdp';
import dayjs from 'dayjs';

const GDPPage: React.FC = () => {
  const [data, setData] = useState<GDPStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState('day');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stats = await fetchGDPStats(interval);
        // Format date for display
        const formattedStats = stats.map(item => ({
          ...item,
          displayDate: dayjs(item.date).format(
            interval === 'year' ? 'YYYY' :
            interval === 'month' ? 'YYYY-MM' :
            interval === 'week' ? 'YYYY-MM-DD' : 'YYYY-MM-DD'
          ),
        }));
        setData(formattedStats);
      } catch (error) {
        console.error('Failed to fetch GDP stats', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [interval]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>GDP Statistics</Heading>
        <Select
          width="200px"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </Select>
      </Flex>
      <Text mb={8}>
        Aggregated value of GDP-relevant fields by {interval}.
      </Text>

      <Box
        bg={bgColor}
        p={6}
        rounded="lg"
        border="1px"
        borderColor={borderColor}
        shadow="sm"
        height="500px"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3182CE" name="GDP Value" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GDPPage;
