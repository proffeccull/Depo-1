import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DataTableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (item: any, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  keyExtractor?: (item: any, index: number) => string;
  onRowPress?: (item: any, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  rowStyle?: ViewStyle;
  cellStyle?: ViewStyle;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  keyExtractor = (item, index) => `${index}`,
  onRowPress,
  onSort,
  sortable = true,
  striped = false,
  bordered = true,
  hoverable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  style,
  headerStyle,
  rowStyle,
  cellStyle,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: DataTableColumn) => {
    if (!sortable || !column.sortable) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column.key);
    setSortDirection(newDirection);
    onSort?.(column.key, newDirection);
  };

  const handleRowPress = (item: any, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRowPress?.(item, index);
  };

  const handleSelectionToggle = (rowKey: string) => {
    const newSelected = selectedRows.includes(rowKey)
      ? selectedRows.filter(key => key !== rowKey)
      : [...selectedRows, rowKey];

    onSelectionChange?.(newSelected);
  };

  const renderHeader = () => (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.gray[50],
          borderBottomWidth: bordered ? 1 : 0,
          borderBottomColor: colors.gray[200],
        },
        headerStyle,
      ]}
    >
      {selectable && (
        <View
          style={{
            width: 40,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 8,
          }}
        >
          <Icon
            name={selectedRows.length === data.length ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            color={colors.primary}
          />
        </View>
      )}

      {columns.map((column) => (
        <TouchableOpacity
          key={column.key}
          onPress={() => handleSort(column)}
          disabled={!sortable || !column.sortable}
          style={[
            {
              flex: column.width ? 0 : 1,
              width: column.width,
              paddingHorizontal: 12,
              paddingVertical: 16,
              justifyContent: 'center',
              alignItems: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
            },
            cellStyle,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.primary,
                textAlign: column.align,
              }}
            >
              {column.title}
            </Text>

            {sortable && column.sortable && (
              <View style={{ marginLeft: 4 }}>
                <Icon
                  name={
                    sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'arrow-upward'
                        : 'arrow-downward'
                      : 'unfold-more'
                  }
                  size={16}
                  color={sortColumn === column.key ? colors.primary : colors.gray[400]}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRow = ({ item, index }: { item: any; index: number }) => {
    const rowKey = keyExtractor(item, index);
    const isSelected = selectedRows.includes(rowKey);
    const isHovered = hoveredRow === rowKey;

    return (
      <MotiView
        animate={{
          backgroundColor: isSelected
            ? colors.primary + '20'
            : isHovered && hoverable
              ? colors.gray[50]
              : striped && index % 2 === 1
                ? colors.gray[25]
                : 'transparent',
        }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <TouchableOpacity
          onPress={() => handleRowPress(item, index)}
          onPressIn={() => setHoveredRow(rowKey)}
          onPressOut={() => setHoveredRow(null)}
          activeOpacity={onRowPress ? 0.7 : 1}
          style={[
            {
              flexDirection: 'row',
              borderBottomWidth: bordered && index < data.length - 1 ? 1 : 0,
              borderBottomColor: colors.gray[200],
            },
            rowStyle,
          ]}
        >
          {selectable && (
            <TouchableOpacity
              onPress={() => handleSelectionToggle(rowKey)}
              style={{
                width: 40,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 12,
              }}
            >
              <Icon
                name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={isSelected ? colors.primary : colors.gray[400]}
              />
            </TouchableOpacity>
          )}

          {columns.map((column) => (
            <View
              key={column.key}
              style={[
                {
                  flex: column.width ? 0 : 1,
                  width: column.width,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  justifyContent: 'center',
                  alignItems: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start',
                },
                cellStyle,
              ]}
            >
              {column.render ? (
                column.render(item, index)
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.primary,
                    textAlign: column.align,
                  }}
                  numberOfLines={2}
                >
                  {item[column.key]}
                </Text>
              )}
            </View>
          ))}
        </TouchableOpacity>
      </MotiView>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pageSize, total, onPageChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
        }}
      >
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          Showing {Math.min((page - 1) * pageSize + 1, total)} to{' '}
          {Math.min(page * pageSize, total)} of {total} entries
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{
              padding: 8,
              marginHorizontal: 4,
              borderRadius: 4,
              backgroundColor: page <= 1 ? colors.gray[200] : colors.primary,
            }}
          >
            <Icon
              name="chevron-left"
              size={20}
              color={page <= 1 ? colors.gray[400] : 'white'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: 8,
              marginHorizontal: 4,
              borderRadius: 4,
              backgroundColor: page >= totalPages ? colors.gray[200] : colors.primary,
            }}
          >
            <Icon
              name="chevron-right"
              size={20}
              color={page >= totalPages ? colors.gray[400] : 'white'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
        <MotiView
          from={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
          }}
        >
          <Icon name="refresh" size={32} color={colors.primary} />
        </MotiView>
        <Text style={{ marginTop: 16, color: colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Icon name="inbox" size={48} color={colors.gray[400]} />
        <Text style={{ marginTop: 16, color: colors.text.secondary, textAlign: 'center' }}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: SCREEN_WIDTH }}>
          {renderHeader()}

          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderRow}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {renderPagination()}
    </View>
  );
};

export default DataTable;